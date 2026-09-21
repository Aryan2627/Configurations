const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const target1 = `  vendor_portal: false,
};`;
const replacement1 = `  vendor_portal: false,
  erp_integration: false,
  supplier_risk_scoring: false,
};`;

const target2 = `<ModuleToggle id="contract_analyzer" label="Legal Contract Analyzer" icon={FileText} desc="Enable CUAD-based legal clause extraction." />
            </div>`;
const replacement2 = `<ModuleToggle id="contract_analyzer" label="Legal Contract Analyzer" icon={FileText} desc="Enable CUAD-based legal clause extraction." />
              <ModuleToggle id="erp_integration" label="ERP Sync Integration" icon={Settings} desc="Enable 2-way SAP/Oracle real-time syncing." />
              <ModuleToggle id="supplier_risk_scoring" label="Supplier Risk Scoring" icon={AlertTriangle} desc="Activate real-time global risk data monitoring." />
            </div>`;

if (content.includes(target1) && content.includes(target2)) {
    content = content.replace(target1, replacement1);
    content = content.replace(target2, replacement2);
    fs.writeFileSync('src/app/dashboard/page.tsx', content);
    console.log("Added more modules!");
} else {
    console.log("Could not find targets");
}