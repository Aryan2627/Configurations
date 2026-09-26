const fs = require('fs');
const path = 'C:/Users/aryan/.gemini/antigravity/scratch/Configurations/src/app/dashboard/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Ensure we don't duplicate
if (!code.includes('Entitlements & Billing')) {
  const replacement = `
                {/* 3. Advanced Entitlements & Billing */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Entitlements & Billing</h2>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Total Seats Allocated</label>
                      <input type='number' value={modules.seats_allocated || 0} onChange={e => { setModules({...modules, seats_allocated: parseInt(e.target.value)}); setIsDirty(true); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Seats Currently Used</label>
                      <input type='number' value={modules.seats_used || 0} onChange={e => { setModules({...modules, seats_used: parseInt(e.target.value)}); setIsDirty(true); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Maintenance SLA Tier</label>
                      <select value={modules.sla_tier || 'Standard'} onChange={e => { setModules({...modules, sla_tier: e.target.value}); setIsDirty(true); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }}>
                        <option value='Standard'>Standard (48h)</option>
                        <option value='Premium'>Premium (24h)</option>
                        <option value='Platinum'>Platinum (4h 24/7)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Contract Expiry Date</label>
                      <input type='date' value={modules.contract_expiry || ''} onChange={e => { setModules({...modules, contract_expiry: e.target.value}); setIsDirty(true); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Next Payment Amount ($)</label>
                      <input type='number' value={modules.payment_due || 0} onChange={e => { setModules({...modules, payment_due: parseInt(e.target.value)}); setIsDirty(true); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Payment Due Date</label>
                      <input type='date' value={modules.payment_date || ''} onChange={e => { setModules({...modules, payment_date: e.target.value}); setIsDirty(true); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={handleSave} disabled={saving || !isDirty} style={{ padding: '10px 24px', background: !isDirty ? '#f1f5f9' : '#10b981', color: !isDirty ? '#94a3b8' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: !isDirty || saving ? 'not-allowed' : 'pointer' }}>
                      {saving ? 'Syncing...' : 'Sync Entitlements'}
                    </button>
                  </div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div>
                      <h2 style={{ color: "#0f172a", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px" }}>Module Configuration</h2>`;

  code = code.replace(/<div style=\{\{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 4px rgba\(0,0,0,0\.02\)" \}\}>\s*<div style=\{\{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" \}\}>\s*<div>\s*<h2 style=\{\{ color: "#0f172a", fontSize: "1\.1rem", fontWeight: 700, margin: "0 0 4px" \}\}>Module Configuration<\/h2>/, replacement);
  fs.writeFileSync(path, code, 'utf8');
}
