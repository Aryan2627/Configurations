'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Server, Box, Users, Settings, Zap, Terminal, Database, FileText, CheckCircle2, AlertTriangle, LogOut } from 'lucide-react';

type Organization = {
  id: string;
  name: string;
  features?: string;
};

const defaultModules = {
  s2p: false,
  cortex_ai: false,
  contract_analyzer: false,
  advanced_analytics: false,
  vendor_portal: false,
  erp_integration: false,
  supplier_risk_scoring: false,
};

export default function DashboardPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [modules, setModules] = useState<typeof defaultModules>(defaultModules);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    if (!localStorage.getItem('config_admin_auth')) {
      router.push('/');
      return;
    }
    
    // Fetch orgs
    fetch('/api/orgs')
      .then(r => r.json())
      .then(data => {
        setOrgs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  // When selected org changes, parse its features
  useEffect(() => {
    if (!selectedOrgId) {
      setModules(defaultModules);
      return;
    }
    const org = orgs.find(o => o.id === selectedOrgId);
    if (org && org.features) {
      try {
        const parsed = JSON.parse(org.features);
        setModules({ ...defaultModules, ...parsed });
      } catch(e) {
        setModules(defaultModules);
      }
    } else {
      setModules(defaultModules);
    }
  }, [selectedOrgId, orgs]);

  const handleSave = async () => {
    if (!selectedOrgId) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedOrgId, features: JSON.stringify(modules) })
      });
      if (res.ok) {
        setSaveSuccess(true);
        // Update local state
        setOrgs(orgs.map(o => o.id === selectedOrgId ? { ...o, features: JSON.stringify(modules) } : o));
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch(e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('config_admin_auth');
    router.push('/');
  };

  const ModuleToggle = ({ id, label, icon: Icon, desc }: any) => (
    <div className="flex items-center justify-between p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${modules[id as keyof typeof modules] ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-slate-200 font-semibold text-sm">{label}</h3>
          <p className="text-slate-500 text-xs mt-1">{desc}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={modules[id as keyof typeof modules]}
          onChange={(e) => setModules({ ...modules, [id]: e.target.checked })}
        />
        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
      </label>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-slate-500">Loading Configuration Engine...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Topbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-indigo-500" size={24} />
            <span className="font-bold text-lg tracking-tight">Procgen <span className="text-indigo-400">Config</span></span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Client Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Users size={18} className="text-emerald-400" />
            <h2 className="font-semibold text-slate-200">Select Client / Tenant</h2>
          </div>
          <div className="relative">
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="" disabled>-- Select a registered organization --</option>
              {orgs.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
              ▼
            </div>
          </div>
        </div>

        {/* Module Configuration */}
        <div className={`transition-all duration-500 ${selectedOrgId ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none translate-y-4'}`}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-blue-400" />
                <h2 className="font-semibold text-slate-200">Module Toggles</h2>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md">Live Sync</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModuleToggle id="cortex_ai" label="Cortex AI Swarm" icon={Zap} desc="Enable multi-agent AI procurement assistant." />
              <ModuleToggle id="s2p" label="Source-to-Pay (S2P)" icon={Server} desc="Enable the full end-to-end S2P branching workflow." />
              <ModuleToggle id="advanced_analytics" label="Advanced Analytics" icon={Database} desc="Enable dynamic dashboard metrics and charts." />
              <ModuleToggle id="vendor_portal" label="Vendor Portal Access" icon={Box} desc="Allow suppliers to access the external bidding portal." />
              <ModuleToggle id="contract_analyzer" label="Legal Contract Analyzer" icon={FileText} desc="Enable CUAD-based legal clause extraction." />
              <ModuleToggle id="erp_integration" label="ERP Sync Integration" icon={Settings} desc="Enable 2-way SAP/Oracle real-time syncing." />
              <ModuleToggle id="supplier_risk_scoring" label="Supplier Risk Scoring" icon={AlertTriangle} desc="Activate real-time global risk data monitoring." />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-end gap-4">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 size={16} /> Saved Successfully
                </div>
              )}
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'Syncing...' : 'Save & Deploy Configuration'}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}