"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, ArrowRight, Lock, Fingerprint, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // CAPTCHA State
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    // Validate CAPTCHA
    if (parseInt(captchaInput) !== (captchaNum1 + captchaNum2)) {
      setError("Human verification failed.");
      generateCaptcha();
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, otp })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Using HttpOnly Cookies now
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid security credentials.");
        generateCaptcha();
        setLoading(false);
      }
    } catch(err) {
      setError("Network timeout. Secure connection failed.");
      generateCaptcha();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040A] flex items-center justify-center relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-900/40 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Subtle Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 px-6">
        
        {/* Glass Card */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
          
          {/* Shine effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-slate-800 to-black border border-white/10 shadow-lg mb-6 relative group">
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Shield className="w-7 h-7 text-blue-400 relative z-10" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">ProcGen Security</h1>
            <p className="text-slate-400 text-sm">Super Admin Configuration Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Password */}
            <div>
              <label className="flex items-center text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                <KeyRound className="w-3.5 h-3.5 mr-2 opacity-70" /> Master Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••••••"
                  autoFocus
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* 2FA OTP */}
            <div>
              <label className="flex items-center text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                <Fingerprint className="w-3.5 h-3.5 mr-2 opacity-70" /> Authenticator Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => setFocusedField('otp')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="000000"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-center text-white font-mono text-xl tracking-[0.5em] placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* CAPTCHA */}
            <div>
              <label className="flex items-center text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 mr-2 opacity-70" /> Human Verification
              </label>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-24 flex items-center justify-center bg-black/40 border border-white/10 rounded-xl text-blue-400 font-mono font-medium select-none">
                  {captchaNum1} + {captchaNum2}
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => setFocusedField('captcha')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Sum"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-center text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Error Message */}
            <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 animate-pulse" />
                {error}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !password || otp.length !== 6 || !captchaInput}
              className="w-full group relative flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl px-4 py-3.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate Session
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer Text */}
        <p className="text-center text-slate-500 text-xs mt-8 font-medium">
          <Lock className="w-3 h-3 inline-block mr-1 -mt-0.5 opacity-60" />
          End-to-end encrypted session
        </p>
      </div>
    </div>
  );
}
