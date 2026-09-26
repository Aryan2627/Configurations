const fs = require('fs');
const path = 'C:/Users/aryan/.gemini/antigravity/scratch/Configurations/src/app/dashboard/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Seats Allocated
code = code.replace(
  /<input type='number' value=\{modules\.seats_allocated \|\| 0\} onChange=\{e => \{ setModules\(\{\.\.\.modules, seats_allocated: parseInt\(e\.target\.value\)\}\); setIsDirty\(true\); \}\} style=\{\{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' \}\} \/>/,
  `<input type='text' inputMode='numeric' pattern='[0-9]*' value={modules.seats_allocated ?? ''} onChange={e => { const val = e.target.value.replace(/\\D/g, ''); setModules({...modules, seats_allocated: val ? parseInt(val, 10) : ''}); setIsDirty(true); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }} />`
);

// Seats Used
code = code.replace(
  /<input type='number' value=\{modules\.seats_used \|\| 0\} onChange=\{e => \{ setModules\(\{\.\.\.modules, seats_used: parseInt\(e\.target\.value\)\}\); setIsDirty\(true\); \}\} style=\{\{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' \}\} \/>/,
  `<input type='text' inputMode='numeric' pattern='[0-9]*' value={modules.seats_used ?? ''} onChange={e => { const val = e.target.value.replace(/\\D/g, ''); setModules({...modules, seats_used: val ? parseInt(val, 10) : ''}); setIsDirty(true); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }} />`
);

// Payment Due
code = code.replace(
  /<input type='number' value=\{modules\.payment_due \|\| 0\} onChange=\{e => \{ setModules\(\{\.\.\.modules, payment_due: parseInt\(e\.target\.value\)\}\); setIsDirty\(true\); \}\} style=\{\{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' \}\} \/>/,
  `<input type='text' inputMode='numeric' pattern='[0-9]*' value={modules.payment_due ?? ''} onChange={e => { const val = e.target.value.replace(/\\D/g, ''); setModules({...modules, payment_due: val ? parseInt(val, 10) : ''}); setIsDirty(true); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }} />`
);

fs.writeFileSync(path, code, 'utf8');
console.log('Fixed numeric inputs in Configurations');
