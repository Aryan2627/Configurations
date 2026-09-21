"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MODULES = [
  { id: "cortex_ai", label: "Cortex AI Swarm", desc: "Multi-agent AI procurement assistant with slash commands and S2P workflow.", category: "AI", color: "#8b5cf6", icon: "🤖", status: "flagship" },
  { id: "s2p", label: "Source-to-Pay", desc: "End-to-end S2P branching workflow from intake to event creation.", category: "Procurement", color: "#3b82f6", icon: "🔄", status: "core" },
  { id: "advanced_analytics", label: "Advanced Analytics", desc: "Dynamic procurement KPI dashboards with real-time metrics.", category: "Analytics", color: "#10b981", icon: "📊", status: "core" },
  { id: "vendor_portal", label: "Vendor Portal", desc: "External supplier portal for bidding, onboarding, and messaging.", category: "Vendor", color: "#f59e0b", icon: "🏪", status: "core" },
  { id: "contract_analyzer", label: "Contract Analyzer", desc: "CUAD-based AI legal clause extraction and risk scoring.", category: "AI", color: "#8b5cf6", icon: "📋", status: "ai" },
  { id: "erp_integration", label: "ERP Sync", desc: "2-way SAP/Oracle/ERP real-time data synchronization.", category: "Integration", color: "#06b6d4", icon: "🔗", status: "integration" },
  { id: "supplier_risk_scoring", label: "Supplier Risk Scoring", desc: "AI-powered real-time global supplier risk monitoring.", category: "AI", color: "#ef4444", icon: "⚠️", status: "ai" },
  { id: "license_manager", label: "License Manager", desc: "Track software licenses, renewals, allocations, and expiry.", category: "Compliance", color: "#f97316", icon: "🔑", status: "core" },
];

const defaultModules = Object.fromEntries(MODULES.map(m => [m.id, false]));

const CATEGORY_COLORS = {
  AI: { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", text: "#a78bfa" },
  Procurement: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", text: "#60a5fa" },
  Analytics: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", text: "#34d399" },
  Vendor: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", text: "#fbbf24" },
  Integration: { bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.2)", text: "#22d3ee" },
  Compliance: { bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", text: "#fb923c" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [modules, setModules] = useState(defaultModules);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchOrg, setSearchOrg] = useState("");
  const [hoveredModule, setHoveredModule] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
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
    setIsDirty(false);
  }, [selectedOrgId, orgs]);

  const toggleModule = (id) => {
    setModules(prev => ({ ...prev, [id]: !prev[id] }));
    setIsDirty(true);
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
  const categories = ["All", ...Array.from(new Set(MODULES.map(m => m.category)))];
  const filteredModules = activeCategory === "All" ? MODULES : MODULES.filter(m => m.category === activeCategory);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%, #1e1040 0%, #090914 60%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <div style={{ width: "40px", height: "40px", border: "3px solid rgba(99,102,241,0.2)", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "rgba(148,163,184,0.5)", fontSize: "0.85rem", fontFamily: "Inter, sans-serif" }}>Loading Configuration Engine...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% -10%, #140f30 0%, #08080f 50%, #000005 100%)", fontFamily: "'Inter', -apple-system, sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); }}
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); }}
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; }}
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; }}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 3px; }
        select option { background: #0f0c1f; }
      `}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(99,102,241,0.1)", background: "rgba(8,8,15,0.8)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(99,102,241,0.35)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <span style={{ color: "#f1f5f9", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Procgen</span>
              <span style={{ color: "#818cf8", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.02em" }}> Config</span>
            </div>
            <span style={{ marginLeft: "4px", padding: "2px 8px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "6px", color: "#818cf8", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em" }}>ADMIN</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {selectedOrg && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", animation: "fadeIn 0.3s ease" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#34d399", fontSize: "0.78rem", fontWeight: 600 }}>{selectedOrg.name}</span>
              </div>
            )}
            {isDirty && (
              <span style={{ padding: "4px 10px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "6px", color: "#fbbf24", fontSize: "0.72rem", fontWeight: 600 }}>● Unsaved changes</span>
            )}
            <a href="/dashboard/form-builder" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", color: "#818cf8", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s", textDecoration: "none", fontWeight: 600 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              Form Builder
            </a>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "rgba(148,163,184,0.8)", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 32px" }}>

        {/* Stats Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Total Clients", value: orgs.length, icon: "🏢", color: "#6366f1" },
            { label: "Active Client", value: selectedOrg ? 1 : 0, icon: "✅", color: "#10b981" },
            { label: "Modules Enabled", value: enabledCount, icon: "⚡", color: "#8b5cf6" },
            { label: "Modules Available", value: MODULES.length, icon: "📦", color: "#3b82f6" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", backdropFilter: "blur(8px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "1.1rem" }}>{stat.icon}</span>
                <span style={{ color: "rgba(100,116,139,0.6)", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{stat.label}</span>
              </div>
              <div style={{ color: "#f1f5f9", fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.04em" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px", alignItems: "start" }}>

          {/* Sidebar - Client selector */}
          <div style={{ position: "sticky", top: "84px" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden", backdropFilter: "blur(12px)" }}>
              <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h2 style={{ color: "#f1f5f9", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 14px", letterSpacing: "-0.01em" }}>Select Client</h2>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.7)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    value={searchOrg}
                    onChange={e => setSearchOrg(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px 9px 34px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#e2e8f0", fontSize: "0.82rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: "420px", overflowY: "auto", padding: "8px" }}>
                {filteredOrgs.length === 0 ? (
                  <div style={{ padding: "32px 20px", textAlign: "center", color: "rgba(100,116,139,0.5)", fontSize: "0.82rem" }}>No organizations found</div>
                ) : filteredOrgs.map(org => (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    style={{ padding: "12px 14px", borderRadius: "12px", cursor: "pointer", transition: "all 0.15s", marginBottom: "4px", background: selectedOrgId === org.id ? "rgba(99,102,241,0.12)" : "transparent", border: selectedOrgId === org.id ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: selectedOrgId === org.id ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: selectedOrgId === org.id ? "white" : "rgba(148,163,184,0.6)", fontSize: "0.8rem", fontWeight: 700 }}>
                        {org.name[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: selectedOrgId === org.id ? "#c4b5fd" : "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{org.name}</div>
                        {org.features && (() => { try { const f = JSON.parse(org.features); const count = Object.values(f).filter(Boolean).length; return <div style={{ color: "rgba(100,116,139,0.7)", fontSize: "0.72rem", marginTop: "2px" }}>{count} module{count !== 1 ? "s" : ""} enabled</div>; } catch { return null; } })()}
                      </div>
                      {selectedOrgId === org.id && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8", flexShrink: 0 }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main - Module toggles */}
          <div>
            {!selectedOrgId ? (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "20px", padding: "80px 40px", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🏢</div>
                <h3 style={{ color: "rgba(148,163,184,0.6)", fontWeight: 600, fontSize: "1rem", margin: "0 0 8px" }}>No client selected</h3>
                <p style={{ color: "rgba(100,116,139,0.5)", fontSize: "0.85rem", margin: 0 }}>Choose an organization from the left panel to configure their platform modules.</p>
              </div>
            ) : (
              <div style={{ animation: "slideIn 0.3s ease" }}>
                {/* Module panel header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Module Configuration</h2>
                    <p style={{ color: "rgba(100,116,139,0.6)", fontSize: "0.8rem", margin: 0 }}>{enabledCount} of {MODULES.length} modules active for {selectedOrg?.name}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {saveSuccess && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "8px", color: "#34d399", fontSize: "0.78rem", fontWeight: 600, animation: "fadeIn 0.3s ease" }}>
                        ✓ Deployed Successfully
                      </div>
                    )}
                    <button onClick={handleSave} disabled={saving || !isDirty} style={{ padding: "9px 20px", background: !isDirty ? "rgba(99,102,241,0.15)" : saving ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "1px solid", borderColor: !isDirty ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.3)", borderRadius: "10px", color: !isDirty ? "rgba(99,102,241,0.4)" : "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: !isDirty || saving ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: isDirty && !saving ? "0 4px 16px rgba(99,102,241,0.3)" : "none", display: "flex", alignItems: "center", gap: "6px" }}>
                      {saving ? <><div style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Deploying...</> : "⚡ Deploy Changes"}
                    </button>
                  </div>
                </div>

                {/* Category filters */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid", borderColor: activeCategory === cat ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)", background: activeCategory === cat ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", color: activeCategory === cat ? "#818cf8" : "rgba(148,163,184,0.6)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Module grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {filteredModules.map(mod => {
                    const isOn = modules[mod.id];
                    const catStyle = CATEGORY_COLORS[mod.category] || { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", text: "#818cf8" };
                    const isHovered = hoveredModule === mod.id;
                    return (
                      <div key={mod.id} onMouseEnter={() => setHoveredModule(mod.id)} onMouseLeave={() => setHoveredModule(null)} style={{ background: isOn ? `rgba(${mod.color.replace('#','').match(/../g).map(h=>parseInt(h,16)).join(',')},0.06)` : "rgba(255,255,255,0.025)", border: isOn ? `1px solid ${mod.color}30` : "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", transition: "all 0.2s", transform: isHovered ? "translateY(-1px)" : "none", boxShadow: isOn && isHovered ? `0 8px 24px ${mod.color}15` : "none" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: isOn ? `${mod.color}20` : "rgba(255,255,255,0.05)", border: `1px solid ${isOn ? mod.color + "30" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, transition: "all 0.2s" }}>
                              {mod.icon}
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <span style={{ color: isOn ? "#f1f5f9" : "rgba(148,163,184,0.8)", fontSize: "0.88rem", fontWeight: 700 }}>{mod.label}</span>
                                <span style={{ padding: "2px 7px", background: catStyle.bg, border: `1px solid ${catStyle.border}`, borderRadius: "5px", color: catStyle.text, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.05em" }}>{mod.category}</span>
                              </div>
                              <p style={{ color: "rgba(100,116,139,0.7)", fontSize: "0.78rem", margin: 0, lineHeight: 1.5 }}>{mod.desc}</p>
                            </div>
                          </div>

                          {/* Toggle */}
                          <div onClick={() => toggleModule(mod.id)} style={{ flexShrink: 0, width: "44px", height: "24px", borderRadius: "12px", background: isOn ? `${mod.color}` : "rgba(255,255,255,0.1)", cursor: "pointer", position: "relative", transition: "all 0.25s", boxShadow: isOn ? `0 0 12px ${mod.color}50` : "none" }}>
                            <div style={{ position: "absolute", top: "3px", left: isOn ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "white", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                          </div>
                        </div>

                        {/* Status bar at bottom */}
                        <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.7rem", color: isOn ? "#34d399" : "rgba(100,116,139,0.4)", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isOn ? "#10b981" : "rgba(100,116,139,0.3)", display: "inline-block" }} />
                            {isOn ? "Active" : "Disabled"}
                          </span>
                          {mod.status === "flagship" && <span style={{ fontSize: "0.65rem", color: "#a78bfa", fontWeight: 700, letterSpacing: "0.06em" }}>★ FLAGSHIP</span>}
                          {mod.status === "ai" && <span style={{ fontSize: "0.65rem", color: "#818cf8", fontWeight: 700, letterSpacing: "0.06em" }}>AI POWERED</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}