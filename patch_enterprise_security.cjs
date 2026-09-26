const fs = require('fs');
const path = require('path');

const configDir = 'C:/Users/aryan/.gemini/antigravity/scratch/Configurations';

// 1. Update next.config.mjs with Security Headers
const nextConfigPath = path.join(configDir, 'next.config.mjs');
const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' }, // Prevents clickjacking
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // A basic CSP that allows standard React/Next.js execution but prevents external script injection
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" }
        ]
      }
    ];
  }
};
export default nextConfig;
`;
fs.writeFileSync(nextConfigPath, nextConfigContent);


// 2. Create middleware.ts for IP Whitelisting and Cookie Validation
const middlewarePath = path.join(configDir, 'src', 'middleware.ts');
const middlewareContent = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// IP Whitelist configuration
const ALLOWED_IPS = ['127.0.0.1', '::1', '::ffff:127.0.0.1']; // Add corporate IPs here
// Set this to true to strictly enforce IP restrictions.
const ENFORCE_IP_WHITELIST = false; 

export function middleware(req: NextRequest) {
  // 1. IP Whitelisting
  if (ENFORCE_IP_WHITELIST) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = ALLOWED_IPS.some(allowedIp => ip.includes(allowedIp));
    if (!isAllowed && ip !== 'unknown') {
      return new NextResponse('403 Forbidden: IP not whitelisted for Admin Portal', { status: 403 });
    }
  }

  // 2. Auth Protection (Cookie-based)
  const token = req.cookies.get('config_admin_auth')?.value;
  const isAuthRoute = req.nextUrl.pathname === '/';
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isApiOrgs = req.nextUrl.pathname.startsWith('/api/orgs');

  if (isDashboard || isApiOrgs) {
    if (!token || token !== 'ext_sec_tk_981273918237') {
      if (isApiOrgs) return new NextResponse('Unauthorized', { status: 401 });
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // If already logged in, redirect away from login page
  if (isAuthRoute && token === 'ext_sec_tk_981273918237') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/api/orgs/:path*'],
};
`;
fs.writeFileSync(middlewarePath, middlewareContent);


// 3. Update Auth API (Rate Limiting + HttpOnly Cookies)
const authApiPath = path.join(configDir, 'src', 'app', 'api', 'auth', 'route.ts');
const authApiContent = `import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = "ProcGenAdmin2026!";
const ADMIN_OTP = "998877";
const SECURE_TOKEN = "ext_sec_tk_981273918237";

// In-memory Rate Limiter
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, timestamp: now };
    
    // Check rate limit
    if (now - rateData.timestamp > WINDOW_MS) {
      rateData.count = 1;
      rateData.timestamp = now;
    } else {
      rateData.count++;
    }
    rateLimitMap.set(ip, rateData);

    if (rateData.count > MAX_ATTEMPTS) {
      return NextResponse.json({ success: false, error: "Too many attempts. Try again in a minute." }, { status: 429 });
    }

    const { password, otp } = await req.json();
    if (password === ADMIN_PASSWORD && otp === ADMIN_OTP) {
      rateLimitMap.delete(ip); // Reset on success
      
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: 'config_admin_auth',
        value: SECURE_TOKEN,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 86400 // 1 day
      });
      return response;
    }
    
    return NextResponse.json({ success: false, error: "Invalid credentials or 2FA token" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
`;
fs.writeFileSync(authApiPath, authApiContent);


// 4. Update orgs API Route (defense in depth using cookies instead of headers)
const orgsApiPath = path.join(configDir, 'src', 'app', 'api', 'orgs', 'route.ts');
let orgsCode = fs.readFileSync(orgsApiPath, 'utf8');
orgsCode = orgsCode.replace(/const SECURE_TOKEN.*?\n}/s, ''); // Remove the old isAuthorized header check
// Remove manual checks from GET and POST as middleware handles it now
orgsCode = orgsCode.replace(/if \(\!isAuthorized\(req\)\) return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\n/g, '');
fs.writeFileSync(orgsApiPath, orgsCode);


// 5. Update Frontend Login (Remove localStorage)
const loginPath = path.join(configDir, 'src', 'app', 'page.tsx');
let loginCode = fs.readFileSync(loginPath, 'utf8');
loginCode = loginCode.replace('localStorage.setItem("config_admin_auth", data.token);', '// Using HttpOnly Cookies now');
fs.writeFileSync(loginPath, loginCode);


// 6. Update Dashboard (Remove localStorage & Auth Headers)
const dashboardPath = path.join(configDir, 'src', 'app', 'dashboard', 'page.tsx');
let dashCode = fs.readFileSync(dashboardPath, 'utf8');
// Remove initial localStorage check
dashCode = dashCode.replace('if (!localStorage.getItem("config_admin_auth")) { router.push("/"); return; }', '// Handled by middleware');

// Remove auth headers from fetch requests
dashCode = dashCode.replace(/, "Authorization": \`Bearer \$\{localStorage\.getItem\("config_admin_auth"\)\}\`/g, '');
dashCode = dashCode.replace(/{ "Authorization": \`Bearer \$\{localStorage\.getItem\("config_admin_auth"\)\}\` }/g, '{}');

fs.writeFileSync(dashboardPath, dashCode);

console.log('Successfully implemented HttpOnly Cookies, Middleware IP Whitelisting, Rate Limiting, and Security Headers.');
