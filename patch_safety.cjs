const fs = require('fs');

const path = 'C:/Users/aryan/.gemini/antigravity/scratch/Configurations/src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'fetch("/api/orgs").then(r => r.json()).then(data => { setOrgs(data || []); setLoading(false); }).catch(() => setLoading(false));',
  'fetch("/api/orgs").then(r => r.json()).then(data => { setOrgs(Array.isArray(data) ? data : []); setLoading(false); }).catch(() => setLoading(false));'
);

content = content.replace(
  'const filteredOrgs = orgs.filter(o => (o.name || "").toLowerCase().includes(searchOrg.toLowerCase()));',
  'const filteredOrgs = (Array.isArray(orgs) ? orgs : []).filter(o => (o?.name || "").toLowerCase().includes(searchOrg.toLowerCase()));'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed dashboard safety');
