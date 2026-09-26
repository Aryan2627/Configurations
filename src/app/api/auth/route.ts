import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = "ProcGenAdmin2026!";
const ADMIN_OTP = "998877";
const SECURE_TOKEN = "ext_sec_tk_981273918237";

export async function POST(req: Request) {
  try {
    const { password, otp } = await req.json();
    if (password === ADMIN_PASSWORD && otp === ADMIN_OTP) {
      return NextResponse.json({ success: true, token: SECURE_TOKEN });
    }
    return NextResponse.json({ success: false, error: "Invalid credentials or 2FA token" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
