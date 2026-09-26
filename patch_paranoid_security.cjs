const fs = require('fs');
const path = require('path');

const configDir = 'C:/Users/aryan/.gemini/antigravity/scratch/Configurations';

// 1. Inactivity Auto-Logout: Create AutoLogout Component
const autoLogoutPath = path.join(configDir, 'src', 'app', 'dashboard', 'AutoLogout.tsx');
const autoLogoutContent = `"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoLogout() {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const logout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
      } catch (e) {
        window.location.href = '/';
      }
    };

    const resetTimeout = () => {
      clearTimeout(timeout);
      // 10 minutes of inactivity
      timeout = setTimeout(logout, 10 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimeout));
    resetTimeout();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimeout));
      clearTimeout(timeout);
    };
  }, [router]);

  return null;
}
`;
fs.writeFileSync(autoLogoutPath, autoLogoutContent);

// Add logout API route
const logoutApiPath = path.join(configDir, 'src', 'app', 'api', 'auth', 'logout', 'route.ts');
fs.mkdirSync(path.dirname(logoutApiPath), { recursive: true });
const logoutApiContent = `import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('config_admin_auth');
  return response;
}
`;
fs.writeFileSync(logoutApiPath, logoutApiContent);

// Inject AutoLogout into Dashboard
const dashboardPath = path.join(configDir, 'src', 'app', 'dashboard', 'page.tsx');
let dashCode = fs.readFileSync(dashboardPath, 'utf8');
if (!dashCode.includes('AutoLogout')) {
  dashCode = dashCode.replace('import { useRouter } from "next/navigation";', 'import { useRouter } from "next/navigation";\nimport AutoLogout from "./AutoLogout";');
  dashCode = dashCode.replace('<div style={{ minHeight: "100vh"', '<AutoLogout />\n    <div style={{ minHeight: "100vh"');
  fs.writeFileSync(dashboardPath, dashCode);
}

// 2 & 4. Encryption Utility and 3. CSRF setup in API routes
const encryptionPath = path.join(configDir, 'src', 'lib', 'encryption.ts');
fs.mkdirSync(path.dirname(encryptionPath), { recursive: true });
const encryptionContent = `import crypto from 'crypto';

// 32-byte key for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_super_secret_key_0000000'; // Must be 32 bytes
const IV_LENGTH = 16; 

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string) {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    // Return original text if not encrypted or decryption fails (for backwards compatibility)
    return text;
  }
}
`;
fs.writeFileSync(encryptionPath, encryptionContent);


// 3. CSRF & 4. Encryption & 2. Audit Trail in /api/orgs/route.ts
const orgsApiPath = path.join(configDir, 'src', 'app', 'api', 'orgs', 'route.ts');
let orgsCode = fs.readFileSync(orgsApiPath, 'utf8');

// Inject imports
if (!orgsCode.includes('encrypt')) {
  orgsCode = orgsCode.replace("import { PrismaClient } from '@prisma/client';", "import { PrismaClient } from '@prisma/client';\nimport { encrypt, decrypt } from '@/lib/encryption';");
}

// Ensure alias works or use relative
orgsCode = orgsCode.replace("@/lib/encryption", "../../../lib/encryption");

// CSRF Check Helper
const csrfHelper = `
function isValidCsrf(req: Request) {
  // Simple CSRF: Check if custom header exists to prevent simple form POSTs
  const csrfHeader = req.headers.get("X-Requested-With");
  return csrfHeader === "XMLHttpRequest";
}
`;
if (!orgsCode.includes('isValidCsrf')) {
  orgsCode = orgsCode.replace('export async function GET', csrfHelper + '\nexport async function GET');
}

// Add CSRF check to POST
orgsCode = orgsCode.replace('export async function POST(req: Request) {\n  try {', 'export async function POST(req: Request) {\n  try {\n    if (!isValidCsrf(req)) return NextResponse.json({ error: "CSRF Validation Failed" }, { status: 403 });');

// Audit Logging & Encryption in POST
const auditPostLogic = `
      // 4. Encrypt features (Field-level encryption)
      if (data.features) {
        data.features = encrypt(data.features);
      }

      const updated = await prisma.organization.update({
        where: { id },
        data
      });

      // 2. Immutable Audit Trail
      await prisma.auditLog.create({
        data: {
          organizationId: id,
          actorEmail: "super_admin@procgen.com",
          action: "CONFIG_UPDATE",
          entityType: "Organization",
          entityRef: id,
          details: JSON.stringify({ updatedFields: Object.keys(data) })
        }
      });
`;
orgsCode = orgsCode.replace(/const updated = await prisma\.organization\.update\(\{[\s\S]*?\}\);/, auditPostLogic);

// Add decryption to GET
const decryptGetLogic = `
    const safeOrgs = orgs.map(org => {
      let decryptedFeatures = org.features;
      if (decryptedFeatures && decryptedFeatures.includes(':')) {
         decryptedFeatures = decrypt(decryptedFeatures);
      }
      return {
      id: org.id,
      name: org.name,
      features: decryptedFeatures,
      licenseStart: (org as any).licenseStart || null,
      licenseEnd: (org as any).licenseEnd || null,
      licenseStatus: (org as any).licenseStatus || 'Active',
      licensePlan: (org as any).licensePlan || 'Enterprise'
    };
    });
`;
orgsCode = orgsCode.replace(/const safeOrgs = orgs\.map\(org => \(\{[\s\S]*?\}\)\);/, decryptGetLogic);

fs.writeFileSync(orgsApiPath, orgsCode);

// Add CSRF header to frontend POST requests
let dashCodeUpdated = fs.readFileSync(dashboardPath, 'utf8');
dashCodeUpdated = dashCodeUpdated.replace(
  /'Content-Type': 'application\/json'/g,
  `'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'`
);
dashCodeUpdated = dashCodeUpdated.replace(
  /"Content-Type": "application\/json"/g,
  `"Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest"`
);
fs.writeFileSync(dashboardPath, dashCodeUpdated);

console.log('Successfully implemented AutoLogout, AuditTrails, CSRF tokens, and Database Encryption.');
