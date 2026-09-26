import { NextResponse } from 'next/server';

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
