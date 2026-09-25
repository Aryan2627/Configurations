const fs = require('fs');
const path = require('path');

const file = path.join('C:', 'Users', 'aryan', '.gemini', 'antigravity', 'scratch', 'Configurations', 'prisma', 'schema.prisma');
let content = fs.readFileSync(file, 'utf8');

// The line is: createdAt DateTime @default(now())
const target = `  createdAt DateTime @default(now())`;
const replacement = `  createdAt DateTime @default(now())
  
  // Licensing
  licenseStart  DateTime?
  licenseEnd    DateTime?
  licenseStatus String?   @default("Active") // Active, Expired, Suspended`;

if (content.includes(target) && !content.includes('licenseStart')) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Added license fields to Organization in Configurations schema!');
} else {
  console.log('Target not found in schema or already patched.');
}
