
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

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
      setError("CAPTCHA validation failed. Are you human?");
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
        localStorage.setItem("config_admin_auth", data.token);
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid access code. Please try again.");
        generateCaptcha();
        setLoading(false);
      }
    } catch(err) {
      setError("Network error. Please try again.");
      generateCaptcha();
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% -10%, #1e1040 0%, #090914 55%, #000008 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.045) 1px, transparent 1px)", backgroundSize: "64px 64px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-5%", right: "15%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: "420px", margin: "0 24px", background: "rgba(13,10,32,0.88)", backdropFilter: "blur(28px)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: "24px", padding: "48px", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "60px", height: "60px", margin: "0 auto 20px", borderRadius: "18px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 1px rgba(99,102,241,0.3), 0 8px 32px rgba(99,102,241,0.4)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.025em" }}>Procgen Config</h1>
          <p style={{ color: "rgba(148,163,184,0.55)", fontSize: "0.8rem", margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>Super Admin Portal</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "rgba(148,163,184,0.75)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "8px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{ width: "100%", padding: "14px 16px", background: focused ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.03)", border: error && !password ? "1px solid rgba(239,68,68,0.45)" : focused ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#f1f5f9", fontSize: "1rem", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "rgba(148,163,184,0.75)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "8px" }}>2FA Code</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="000000"
              style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#f1f5f9", fontSize: "1rem", outline: "none", boxSizing: "border-box", letterSpacing: "0.2em", textAlign: "center" }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", color: "rgba(148,163,184,0.75)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "8px" }}>Human Verification</label>
            <div style={{ display: "flex", gap: "12px" }}>
               <div style={{ flex: "0 0 100px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#a8b2d1", fontWeight: "bold", userSelect: "none" }}>
                 {captchaNum1} + {captchaNum2}
               </div>
               <input
                 type="text"
                 value={captchaInput}
                 onChange={e => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                 placeholder="Answer"
                 style={{ flex: 1, width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#f1f5f9", fontSize: "1rem", outline: "none", boxSizing: "border-box", textAlign: "center" }}
               />
            </div>
            {error && <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>⚠️ {error}</p>}
          </div>

          <button type="submit" disabled={loading || !password || !otp || !captchaInput} style={{ width: "100%", padding: "14px", background: loading || !password || !otp || !captchaInput ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "0.9rem", fontWeight: 600, cursor: loading || !password || !otp || !captchaInput ? "not-allowed" : "pointer", letterSpacing: "0.01em", transition: "all 0.25s", boxShadow: loading || !password || !otp || !captchaInput ? "none" : "0 4px 24px rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", opacity: (!password || !otp || !captchaInput) ? 0.5 : 1 }}>
            {loading ? (
              <>
                <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.25)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Authenticating...
              </>
            ) : "Secure Login →"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "rgba(71,85,105,0.7)", fontSize: "0.7rem", marginTop: "28px", marginBottom: 0 }}>
          Restricted to authorized Procgen administrators only
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
