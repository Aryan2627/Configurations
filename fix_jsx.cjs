const fs = require('fs');
const file = 'C:/Users/aryan/.gemini/antigravity/scratch/Configurations/src/app/dashboard/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the top level
code = code.replace('<AutoLogout />\n    <div style={{ minHeight: "100vh"', '<>\n      <AutoLogout />\n      <div style={{ minHeight: "100vh"');

// Wrap the final return
code = code.replace('  );\n}\n', '    </>\n  );\n}\n');

fs.writeFileSync(file, code);
console.log('Fixed JSX wrapping');
