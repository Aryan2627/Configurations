const fs = require('fs');
const path = require('path');

const file = path.join('C:', 'Users', 'aryan', '.gemini', 'antigravity', 'scratch', 'Configurations', 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the UI Header
const headerRegex = /\{\/\*\s*Module panel header\s*\*\/\}\s*<div style=\{\{\s*display:\s*"flex",\s*alignItems:\s*"center",\s*justifyContent:\s*"space-between",\s*marginBottom:\s*"20px"\s*\}\}>/m;

const newHeader = `{/* Tabs */}
                  <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
                    <div onClick={() => setActiveTab('Modules')} style={{ paddingBottom: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: activeTab === 'Modules' ? '#fff' : 'rgba(255,255,255,0.5)', borderBottom: activeTab === 'Modules' ? '2px solid #818cf8' : '2px solid transparent' }}>Modules</div>
                    <div onClick={() => setActiveTab('License')} style={{ paddingBottom: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: activeTab === 'License' ? '#fff' : 'rgba(255,255,255,0.5)', borderBottom: activeTab === 'License' ? '2px solid #818cf8' : '2px solid transparent' }}>License</div>
                  </div>

                  {activeTab === 'Modules' && (
                    <>
                  {/* Module panel header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>`;

if (headerRegex.test(content)) {
  content = content.replace(headerRegex, newHeader);
  console.log("Replaced header UI successfully");
} else {
  console.log("Header UI regex did not match!");
}

// Now replace the footer to close the activeTab
// The end of the module mapping is:
//                      );
//                    })}
//                  </div>

const footerRegex = /\s*\);\s*\}\)\}\s*<\/div>/;

const newFooter = `                      );
                    })}
                  </div>
                  </>
                  )}
                  
                  {activeTab === 'License' && (
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)", animation: "fadeIn 0.3s ease" }}>
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
                            <option value="Active" style={{ background: '#0f172a' }}>Active</option>
                            <option value="Expired" style={{ background: '#0f172a' }}>Expired</option>
                            <option value="Suspended" style={{ background: '#0f172a' }}>Suspended</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleSaveLicense} disabled={saving} style={{ padding: "10px 24px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>{saving ? 'Saving...' : 'Save License Settings'}</button>
                        {saveSuccess && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}>License successfully updated!</span>}
                      </div>
                    </div>
                  )}
`;

if (footerRegex.test(content)) {
  content = content.replace(footerRegex, newFooter);
  console.log("Replaced footer UI successfully");
} else {
  console.log("Footer UI regex did not match!");
}

fs.writeFileSync(file, content, 'utf8');
