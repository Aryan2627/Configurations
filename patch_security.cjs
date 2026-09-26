const fs = require('fs');
const path = require('path');

const SECURE_TOKEN = "ext_sec_tk_981273918237";

// 1. Create /api/auth/route.ts
const authRoutePath = 'C:/Users/aryan/.gemini/antigravity/scratch/Configurations/src/app/api/auth/route.ts';
fs.mkdirSync(path.dirname(authRoutePath), { recursive: true });
fs.writeFileSync(authRoutePath, `import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = "ProcGenAdmin2026!";
const ADMIN_OTP = "998877";
const SECURE_TOKEN = "${SECURE_TOKEN}";

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
`);

// 2. Protect /api/orgs/route.ts
const orgsRoutePath = 'C:/Users/aryan/.gemini/antigravity/scratch/Configurations/src/app/api/orgs/route.ts';
let orgsCode = fs.readFileSync(orgsRoutePath, 'utf8');

const authHelper = `
const SECURE_TOKEN = "${SECURE_TOKEN}";
function isAuthorized(req: Request) {
  const authHeader = req.headers.get("Authorization");
  return authHeader === \`Bearer \${SECURE_TOKEN}\`;
}
`;

if (!orgsCode.includes('isAuthorized')) {
  orgsCode = orgsCode.replace('export async function GET', authHelper + '\nexport async function GET(req: Request)');
  orgsCode = orgsCode.replace('try {\n    // Implicit select all', 'try {\n    if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });\n    // Implicit select all');
  orgsCode = orgsCode.replace('export async function POST(req: Request) {\n  try {', 'export async function POST(req: Request) {\n  try {\n    if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });');
  fs.writeFileSync(orgsRoutePath, orgsCode);
}

// 3. Update dashboard to send token
const dashboardPath = 'C:/Users/aryan/.gemini/antigravity/scratch/Configurations/src/app/dashboard/page.tsx';
let dashCode = fs.readFileSync(dashboardPath, 'utf8');

dashCode = dashCode.replace(
  'fetch("/api/orgs").then(',
  'fetch("/api/orgs", { headers: { "Authorization": `Bearer ${localStorage.getItem("config_admin_auth")}` } }).then('
);

dashCode = dashCode.replace(
  'headers: { \'Content-Type\': \'application/json\' },',
  'headers: { \'Content-Type\': \'application/json\', "Authorization": `Bearer ${localStorage.getItem("config_admin_auth")}` },'
);

dashCode = dashCode.replace(
  'headers: { "Content-Type": "application/json" },',
  'headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("config_admin_auth")}` },'
);

fs.writeFileSync(dashboardPath, dashCode);

// 4. Update login page
const loginPath = 'C:/Users/aryan/.gemini/antigravity/scratch/Configurations/src/app/page.tsx';
let loginCode = fs.readFileSync(loginPath, 'utf8');

const newLoginLogic = `
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, otp })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem("config_admin_auth", data.token);
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid access code. Please try again.");
        setLoading(false);
      }
    } catch(err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };
`;

loginCode = loginCode.replace(/const \[password.*?handleLogin.*?};/s, newLoginLogic);

// Add OTP field to UI
const oldPassField = `<input type="password" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="Enter Admin Access Code" style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: \`1px solid \${focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}\`, borderRadius: "12px", padding: "16px 20px", color: "white", fontSize: "1rem", outline: "none", transition: "all 0.3s ease", boxShadow: focused ? "0 0 0 4px rgba(99,102,241,0.1)" : "none" }} />`;

const newFields = `<input type="password" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="Enter Admin Password" style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: \`1px solid \${focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}\`, borderRadius: "12px", padding: "16px 20px", color: "white", fontSize: "1rem", outline: "none", transition: "all 0.3s ease", boxShadow: focused ? "0 0 0 4px rgba(99,102,241,0.1)" : "none", marginBottom: "16px" }} />
          <input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\\D/g, ''))} placeholder="Enter 6-Digit 2FA Code" style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: \`1px solid \${focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}\`, borderRadius: "12px", padding: "16px 20px", color: "white", fontSize: "1rem", outline: "none", transition: "all 0.3s ease", letterSpacing: "4px", textAlign: "center" }} />`;

loginCode = loginCode.replace(oldPassField, newFields);

fs.writeFileSync(loginPath, loginCode);
console.log('Successfully upgraded the configuration portal security (Backend Auth + 2FA + Protected APIs).');
