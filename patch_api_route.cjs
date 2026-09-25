const fs = require('fs');
const path = require('path');

// Fix API Route
const routeFile = path.join('C:', 'Users', 'aryan', '.gemini', 'antigravity', 'scratch', 'Configurations', 'src', 'app', 'api', 'orgs', 'route.ts');
let routeContent = fs.readFileSync(routeFile, 'utf8');

// Also update GET to fetch license fields
routeContent = routeContent.replace(
  `select: { id: true, name: true, features: true },`,
  `select: { id: true, name: true, features: true, licenseStart: true, licenseEnd: true, licenseStatus: true },`
);

// Update POST to accept license fields
const postBlock = `export async function POST(req: Request) {
  try {
    const { id, features } = await req.json();
    const updated = await prisma.organization.update({
      where: { id },
      data: { features }
    });`;

const newPostBlock = `export async function POST(req: Request) {
  try {
    const { id, features, licenseStart, licenseEnd, licenseStatus } = await req.json();
    const data = {};
    if (features !== undefined) data.features = features;
    if (licenseStart !== undefined) data.licenseStart = licenseStart;
    if (licenseEnd !== undefined) data.licenseEnd = licenseEnd;
    if (licenseStatus !== undefined) data.licenseStatus = licenseStatus;
    
    const updated = await prisma.organization.update({
      where: { id },
      data
    });`;

if (routeContent.includes(postBlock)) {
  routeContent = routeContent.replace(postBlock, newPostBlock);
  fs.writeFileSync(routeFile, routeContent, 'utf8');
  console.log('Fixed API route');
} else {
  console.log('Could not fix API route block');
}

// Fix Frontend Page fetch
const pageFile = path.join('C:', 'Users', 'aryan', '.gemini', 'antigravity', 'scratch', 'Configurations', 'src', 'app', 'dashboard', 'page.tsx');
let pageContent = fs.readFileSync(pageFile, 'utf8');

const badFetch = `await fetch('/api/orgs/' + selectedOrgId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          licenseStart: licenseData.start ? new Date(licenseData.start).toISOString() : null,
          licenseEnd: licenseData.end ? new Date(licenseData.end).toISOString() : null,
          licenseStatus: licenseData.status
        })
      });`;

const goodFetch = `await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedOrgId,
          licenseStart: licenseData.start ? new Date(licenseData.start).toISOString() : null,
          licenseEnd: licenseData.end ? new Date(licenseData.end).toISOString() : null,
          licenseStatus: licenseData.status
        })
      });`;

if (pageContent.includes(badFetch)) {
  pageContent = pageContent.replace(badFetch, goodFetch);
  fs.writeFileSync(pageFile, pageContent, 'utf8');
  console.log('Fixed Page fetch');
} else {
  console.log('Could not fix badFetch in Page');
}
