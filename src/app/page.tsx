'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, User } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      // In a real app, use next-auth or set a secure httpOnly cookie.
      // For this prototype, we'll use a simple localStorage token for fast demonstration
      localStorage.setItem('config_admin_auth', 'true');
      router.push('/dashboard');
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/20 blur-[150px]" />

      <div className="z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Shield size={32} className="text-indigo-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-slate-100 mb-2">Configurations Portal</h1>
        <p className="text-center text-slate-400 text-sm mb-8">Enter your secure PIN to access tenant configurations.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-500" />
              </div>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(false); }}
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm"
                placeholder="Enter PIN (1234)"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-400 text-center">Invalid PIN. Please try again.</p>}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all"
          >
            Authenticate
          </button>
        </form>
      </div>
      <div className="mt-8 text-center text-slate-600 text-xs font-medium z-10">
        POWERED BY PROCGEN INC.
      </div>
    </div>
  );
}