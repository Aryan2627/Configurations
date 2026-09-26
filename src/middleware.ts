import { NextResponse } from 'next/server';
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
