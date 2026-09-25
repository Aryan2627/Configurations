const fs = require('fs');
const path = require('path');

const file = path.join('C:', 'Users', 'aryan', '.gemini', 'antigravity', 'scratch', 'Configurations', 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add activeTab and license state
const stateInsertion = `  const [hoveredModule, setHoveredModule] = useState(null);`;
const stateReplacement = `  const [hoveredModule, setHoveredModule] = useState(null);
  const [activeTab, setActiveTab] = useState("Modules");
  const [licenseData, setLicenseData] = useState({ start: "", end: "", status: "Active" });`;
if (content.includes(stateInsertion)) {
  content = content.replace(stateInsertion, stateReplacement);
}

// 2. Fetch the license data when an organization is selected
const orgSelectBlock = `    if (selectedOrgId) {
      const org = orgs.find(o => o.id === selectedOrgId);
      if (org && org.features) {
        try {
          const parsed = JSON.parse(org.features);
          setModules({ ...defaultModules, ...parsed });
        } catch {
          setModules(defaultModules);
        }
      } else {
        setModules(defaultModules);
      }
      setIsDirty(false);
      setSaveSuccess(false);
    }`;

const orgSelectReplacement = `    if (selectedOrgId) {
      const org = orgs.find(o => o.id === selectedOrgId);
      if (org && org.features) {
        try {
          const parsed = JSON.parse(org.features);
          setModules({ ...defaultModules, ...parsed });
        } catch {
          setModules(defaultModules);
        }
      } else {
        setModules(defaultModules);
      }
      if (org) {
        setLicenseData({
          start: org.licenseStart ? new Date(org.licenseStart).toISOString().split('T')[0] : "",
          end: org.licenseEnd ? new Date(org.licenseEnd).toISOString().split('T')[0] : "",
          status: org.licenseStatus || "Active"
        });
      }
      setIsDirty(false);
      setSaveSuccess(false);
    }`;
if (content.includes(orgSelectBlock)) {
  content = content.replace(orgSelectBlock, orgSelectReplacement);
}

// 3. Add handleSaveLicense
const handleSaveBlock = `  const handleSave = async () => {`;
const newHandleSave = `  const handleSaveLicense = async () => {
    setSaving(true);
    try {
      await fetch('/api/orgs/' + selectedOrgId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          licenseStart: licenseData.start ? new Date(licenseData.start).toISOString() : null,
          licenseEnd: licenseData.end ? new Date(licenseData.end).toISOString() : null,
          licenseStatus: licenseData.status
        })
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch(e) {
      alert("Failed to save license");
    }
    setSaving(false);
  };

  const handleSave = async () => {`;
if (content.includes(handleSaveBlock)) {
  content = content.replace(handleSaveBlock, newHandleSave);
}

// 4. Inject Tabs into UI
const uiHeaderBlock = `{/* Module panel header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>`;
const newUiHeader = `{/* Tabs */}
                  <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
                    <div onClick={() => setActiveTab('Modules')} style={{ paddingBottom: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: activeTab === 'Modules' ? '#fff' : 'rgba(255,255,255,0.5)', borderBottom: activeTab === 'Modules' ? '2px solid #818cf8' : '2px solid transparent' }}>Modules</div>
                    <div onClick={() => setActiveTab('License')} style={{ paddingBottom: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: activeTab === 'License' ? '#fff' : 'rgba(255,255,255,0.5)', borderBottom: activeTab === 'License' ? '2px solid #818cf8' : '2px solid transparent' }}>License</div>
                  </div>

                  {activeTab === 'Modules' && (
                    <>
                  {/* Module panel header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>`;

if (content.includes(uiHeaderBlock)) {
  content = content.replace(uiHeaderBlock, newUiHeader);
}

// 5. Close the activeTab condition and inject the License Panel
const uiFooterBlock = `                          </div>
                        </div>
                      );
                    })}
                  </div>`;
const newUiFooter = `                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                  )}
                  {activeTab === 'License' && (
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <h3 style={{ color: "#f1f5f9", margin: "0 0 20px", fontSize: "1.1rem" }}>Client License Configuration</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                          <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontSize: '0.8rem' }}>Start Date</label>
                          <input type="date" value={licenseData.start} onChange={e => setLicenseData({...licenseData, start: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontSize: '0.8rem' }}>End Date (Expiry)</label>
                          <input type="date" value={licenseData.end} onChange={e => setLicenseData({...licenseData, end: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontSize: '0.8rem' }}>Status</label>
                          <select value={licenseData.status} onChange={e => setLicenseData({...licenseData, status: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleSaveLicense} disabled={saving} style={{ padding: "10px 24px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>{saving ? 'Saving...' : 'Save License'}</button>
                        {saveSuccess && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}>License updated!</span>}
                      </div>
                    </div>
                  )}
                  `;
if (content.includes(uiFooterBlock)) {
  content = content.replace(uiFooterBlock, newUiFooter);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Added License tab to Config Dashboard!');