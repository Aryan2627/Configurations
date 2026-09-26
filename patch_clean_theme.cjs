const fs = require('fs');
const path = require('path');

const file = path.join('C:', 'Users', 'aryan', '.gemini', 'antigravity', 'scratch', 'Configurations', 'src', 'app', 'dashboard', 'page.tsx');

const content = `"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MODULES = [
  { id: "cortex_ai", label: "Cortex AI Swarm", desc: "Multi-agent AI procurement assistant with slash commands and S2P workflow.", category: "AI", color: "#8b5cf6", icon: "🤖", status: "flagship" },
  { id: "s2p", label: "Source-to-Pay", desc: "End-to-end S2P branching workflow from intake to event creation.", category: "Procurement", color: "#3b82f6", icon: "🔄", status: "core" },
  { id: "advanced_analytics", label: "Advanced Analytics", desc: "Dynamic procurement KPI dashboards with real-time metrics.", category: "Analytics", color: "#10b981", icon: "📊", status: "core" },
  { id: "vendor_portal", label: "Vendor Portal", desc: "External supplier portal for bidding, onboarding, and messaging.", category: "Vendor", color: "#f59e0b", icon: "🏪", status: "core" },
  { id: "contract_analyzer", label: "Contract Analyzer", desc: "CUAD-based AI legal clause extraction and risk scoring.", category: "AI", color: "#8b5cf6", icon: "📄", status: "ai" },
  { id: "erp_integration", label: "ERP Sync", desc: "2-way SAP/Oracle/ERP real-time data synchronization.", category: "Integration", color: "#06b6d4", icon: "🔗", status: "integration" },
  { id: "supplier_risk_scoring", label: "Supplier Risk Scoring", desc: "AI-powered real-time global supplier risk monitoring.", category: "AI", color: "#ef4444", icon: "🚨", status: "ai" },
  { id: "license_manager", label: "License Manager", desc: "Track software licenses, renewals, allocations, and expiry.", category: "Compliance", color: "#f97316", icon: "🛡️", status: "core" },
];

const defaultModules = Object.fromEntries(MODULES.map(m => [m.id, false]));

export default function DashboardPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [modules, setModules] = useState(defaultModules);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [licenseSaving, setLicenseSaving] = useState(false);
  const [licenseSuccess, setLicenseSuccess] = useState(false);

  const [loading, setLoading] = useState(true);
  const [searchOrg, setSearchOrg] = useState("");
  const [licenseData, setLicenseData] = useState({ start: "", end: "", status: "Active" });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("config_admin_auth")) { router.push("/"); return; }
    fetch("/api/orgs").then(r => r.json()).then(data => { setOrgs(data); setLoading(false); }).catch(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!selectedOrgId) { setModules(defaultModules); setIsDirty(false); return; }
    const org = orgs.find(o => o.id === selectedOrgId);
    if (org && org.features) {
      try { setModules({ ...defaultModules, ...JSON.parse(org.features) }); } catch { setModules(defaultModules); }
    } else { setModules(defaultModules); }
    
    if (org) {
      setLicenseData({
        start: org.licenseStart ? new Date(org.licenseStart).toISOString().split('T')[0] : "",
        end: org.licenseEnd ? new Date(org.licenseEnd).toISOString().split('T')[0] : "",
        status: org.licenseStatus || "Active"
      });
    }
    setIsDirty(false);
  }, [selectedOrgId, orgs]);

  const toggleModule = (id) => {
    setModules(prev => ({ ...prev, [id]: !prev[id] }));
    setIsDirty(true);
  };

  const handleSaveLicense = async () => {
    setLicenseSaving(true);
    try {
      await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedOrgId,
          licenseStart: licenseData.start ? new Date(licenseData.start).toISOString() : null,
          licenseEnd: licenseData.end ? new Date(licenseData.end).toISOString() : null,
          licenseStatus: licenseData.status
        })
      });
      setLicenseSuccess(true);
      setTimeout(() => setLicenseSuccess(false), 3000);
    } catch(e) {
      alert("Failed to save license");
    }
    setLicenseSaving(false);
  };

  const handleSave = async () => {
    if (!selectedOrgId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/orgs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selectedOrgId, features: JSON.stringify(modules) }) });
      if (res.ok) {
        setSaveSuccess(true);
        setOrgs(orgs.map(o => o.id === selectedOrgId ? { ...o, features: JSON.stringify(modules) } : o));
        setIsDirty(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {}
    setSaving(false);
  };

  const handleLogout = () => { localStorage.removeItem("config_admin_auth"); router.push("/"); };

  const selectedOrg = orgs.find(o => o.id === selectedOrgId);
  const enabledCount = Object.values(modules).filter(Boolean).length;
  const filteredOrgs = orgs.filter(o => o.name.toLowerCase().includes(searchOrg.toLowerCase()));

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faff", color: "#475569" }}>Loading Configuration Engine...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "'Inter', system-ui, sans-serif", color: "#0f172a" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #e2e8f0", background: "#ffffff" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <span style={{ color: "#0f172a", fontSize: "1rem", fontWeight: 700 }}>Procgen Config</span>
            </div>
            <span style={{ padding: "4px 8px", background: "#e0e7ff", border: "1px solid #c7d2fe", borderRadius: "6px", color: "#4f46e5", fontSize: "0.7rem", fontWeight: 700 }}>ADMIN</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <a href="/dashboard/form-builder" style={{ color: "#4f46e5", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600 }}>Form Builder</a>
            <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px", alignItems: "start" }}>

          {/* Sidebar - Client selector */}
          <div style={{ position: "sticky", top: "84px" }}>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <h2 style={{ color: "#0f172a", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 14px" }}>Select Client</h2>
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchOrg}
                  onChange={e => setSearchOrg(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ maxHeight: "420px", overflowY: "auto", padding: "12px" }}>
                {filteredOrgs.map(org => (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    style={{ padding: "12px 14px", borderRadius: "8px", cursor: "pointer", marginBottom: "4px", background: selectedOrgId === org.id ? "#eff6ff" : "transparent", border: selectedOrgId === org.id ? "1px solid #bfdbfe" : "1px solid transparent" }}
                  >
                    <div style={{ color: selectedOrgId === org.id ? "#1d4ed8" : "#334155", fontSize: "0.9rem", fontWeight: 600 }}>{org.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div>
            {!selectedOrgId ? (
              <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: "16px", padding: "80px 40px", textAlign: "center" }}>
                <h3 style={{ color: "#475569", fontWeight: 600, fontSize: "1.1rem", margin: "0 0 8px" }}>No client selected</h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>Choose an organization from the left panel to configure their platform.</p>
              </div>
            ) : (
              <div>
                
                {/* 1. License Configuration Section (SUPER VISIBLE) */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ color: "#0f172a", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>License Configuration</h2>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Start Date</label>
                      <input type="date" value={licenseData.start} onChange={e => setLicenseData({...licenseData, start: e.target.value})} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>End Date (Expiry)</label>
                      <input type="date" value={licenseData.end} onChange={e => setLicenseData({...licenseData, end: e.target.value})} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Status</label>
                      <select value={licenseData.status} onChange={e => setLicenseData({...licenseData, status: e.target.value})} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px' }}>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: "center" }}>
                    <button onClick={handleSaveLicense} disabled={licenseSaving} style={{ padding: "10px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>{licenseSaving ? 'Saving...' : 'Save License Settings'}</button>
                    {licenseSuccess && <span style={{ color: '#10b981', fontWeight: 600, fontSize: "0.85rem" }}>License updated!</span>}
                  </div>
                </div>

                {/* 2. Module Configuration Section */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div>
                      <h2 style={{ color: "#0f172a", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px" }}>Module Configuration</h2>
                      <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>{enabledCount} of {MODULES.length} modules active</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={handleSave} disabled={saving || !isDirty} style={{ padding: "9px 20px", background: !isDirty ? "#f1f5f9" : "#2563eb", color: !isDirty ? "#94a3b8" : "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: !isDirty || saving ? "not-allowed" : "pointer" }}>
                        {saving ? "Deploying..." : "Deploy Modules"}
                      </button>
                      {saveSuccess && <span style={{ color: '#10b981', fontWeight: 600, fontSize: "0.85rem" }}>Deployed!</span>}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {MODULES.map(mod => {
                      const isOn = modules[mod.id];
                      return (
                        <div key={mod.id} onClick={() => toggleModule(mod.id)} style={{ background: isOn ? "#eff6ff" : "#f8fafc", border: isOn ? "1px solid #bfdbfe" : "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "all 0.15s" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "1.2rem" }}>{mod.icon}</span>
                              <span style={{ fontWeight: 600, color: isOn ? "#1e40af" : "#475569" }}>{mod.label}</span>
                            </div>
                            <div style={{ width: "36px", height: "20px", background: isOn ? "#2563eb" : "#cbd5e1", borderRadius: "20px", position: "relative" }}>
                              <div style={{ position: "absolute", top: "2px", left: isOn ? "18px" : "2px", width: "16px", height: "16px", background: "#fff", borderRadius: "50%", transition: "all 0.2s" }} />
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: isOn ? "#3b82f6" : "#64748b" }}>{mod.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
`;

fs.writeFileSync(file, content, 'utf8');
console.log('Completely rebuilt Configurations dashboard!');
