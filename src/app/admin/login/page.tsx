"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLoginPage() {
  const { login, token, isLoading } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);

  useEffect(() => {
    if (!isLoading && token) {
      router.replace("/admin/dashboard");
    }
  }, [token, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060608" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/60">
            <span className="text-white text-sm font-black">SS</span>
          </div>
          <div className="w-6 h-6 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes float-med {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.02); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 40px) scale(1.05); }
          66% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .orb-1 { animation: orb1 12s ease-in-out infinite; }
        .orb-2 { animation: orb2 15s ease-in-out infinite; }
        .orb-3 { animation: orb1 18s ease-in-out infinite reverse; }
        .float-card { animation: float-slow 6s ease-in-out infinite; }
        .float-card-2 { animation: float-med 8s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #a78bfa 0%, #e879f9 25%, #c4b5fd 50%, #818cf8 75%, #a78bfa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .slide-up-1 { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .slide-up-2 { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
        .slide-up-3 { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
        .slide-up-4 { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
        .slide-up-5 { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both; }
        .fade-in { animation: fade-in 0.8s ease both; }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }
        .input-dark {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
          transition: all 0.2s ease;
        }
        .input-dark::placeholder { color: rgba(148, 163, 184, 0.4); }
        .input-dark:focus { background: rgba(255, 255, 255, 0.07); border-color: rgba(139, 92, 246, 0.6); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12), inset 0 1px 0 rgba(255,255,255,0.05); outline: none; }
        .input-dark:hover:not(:focus) { border-color: rgba(255, 255, 255, 0.14); }
        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.025;
        }
        .btn-glow {
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-glow:hover:not(:disabled) {
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.45), 0 2px 8px rgba(139, 92, 246, 0.3);
          transform: translateY(-1px);
        }
        .btn-glow:active:not(:disabled) { transform: translateY(0); }
        .stat-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(139, 92, 246, 0.2);
        }
        .feature-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .feature-row:last-child { border-bottom: none; }
        .dot-grid {
          background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <div
        className="min-h-screen flex relative overflow-hidden"
        style={{ background: "#060608" }}
      >
        {/* ── Ambient background orbs ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="orb-1 absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full opacity-[0.15]"
            style={{ background: "radial-gradient(circle at center, #7c3aed 0%, transparent 65%)" }}
          />
          <div
            className="orb-2 absolute -bottom-32 right-[30%] w-[500px] h-[500px] rounded-full opacity-[0.10]"
            style={{ background: "radial-gradient(circle at center, #4f46e5 0%, transparent 65%)" }}
          />
          <div
            className="orb-3 absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle at center, #a855f7 0%, transparent 65%)" }}
          />
        </div>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-30" />

        {/* Noise texture */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* ── Left panel ── */}
        <div className="hidden lg:flex flex-col justify-between w-[52%] xl:w-[55%] p-12 xl:p-16 relative z-10">

          {/* Brand mark */}
          <div className="fade-in flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/60">
                <span className="text-white text-sm font-black tracking-tight">SS</span>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060608]" />
            </div>
            <div>
              <p className="text-white text-[15px] font-bold tracking-tight">ShajSutro</p>
              <p className="text-zinc-600 text-[10px] font-semibold tracking-[0.2em] uppercase">Admin Console</p>
            </div>
          </div>

          {/* Center hero content */}
          <div className="max-w-[500px]">
            <div className="slide-up-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-400 text-[11px] font-semibold tracking-widest uppercase">Secure Access Portal</span>
            </div>

            <h1 className="slide-up-2 text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight mb-5">
              <span className="text-white block">Control your</span>
              <span className="shimmer-text block">store, your way.</span>
            </h1>

            <p className="slide-up-3 text-zinc-500 text-[15px] leading-relaxed mb-10 max-w-[400px]">
              A powerful admin suite giving you full visibility over every product, order, and customer — in real time.
            </p>

            {/* Feature list */}
            <div className="slide-up-4 rounded-2xl overflow-hidden glass-card">
              {[
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  ),
                  title: "Real-time Analytics",
                  desc: "Revenue, orders & traffic at a glance",
                  color: "#8b5cf6",
                  bg: "rgba(139,92,246,0.12)",
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  ),
                  title: "Product Management",
                  desc: "Inventory, pricing & catalog control",
                  color: "#818cf8",
                  bg: "rgba(129,140,248,0.12)",
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  ),
                  title: "User & Order Hub",
                  desc: "Customers, sessions & order tracking",
                  color: "#a78bfa",
                  bg: "rgba(167,139,250,0.12)",
                },
              ].map((feat) => (
                <div key={feat.title} className="feature-row flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: feat.bg, color: feat.color }}>
                    {feat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-semibold leading-none mb-1">{feat.title}</p>
                    <p className="text-zinc-600 text-[11px] leading-none">{feat.desc}</p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="slide-up-5 flex items-center gap-3 mt-5">
              {[
                { val: "100%", label: "Uptime" },
                { val: "256-bit", label: "Encryption" },
                { val: "24/7", label: "Monitoring" },
              ].map((s) => (
                <div key={s.label} className="stat-card flex-1 rounded-xl px-4 py-3 text-center">
                  <p className="text-white text-sm font-bold mb-0.5">{s.val}</p>
                  <p className="text-zinc-600 text-[10px] font-medium tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="fade-in text-zinc-700 text-xs">
            © {new Date().getFullYear()} ShajSutro. All rights reserved.
          </p>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
          {/* Vertical divider */}
          <div
            className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)" }}
          />

          <div className="w-full max-w-[400px]">
            {/* Mobile brand */}
            <div className="flex items-center gap-3 mb-10 lg:hidden slide-up-1">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-md shadow-violet-900/50">
                  <span className="text-white text-xs font-black">SS</span>
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#060608]" />
              </div>
              <div>
                <p className="text-white text-[14px] font-bold">ShajSutro Admin</p>
                <p className="text-zinc-600 text-[10px] font-semibold tracking-widest uppercase">Console</p>
              </div>
            </div>

            {/* Form card */}
            <div className="slide-up-2 glass-card rounded-3xl p-8">
              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-md shadow-violet-900/50">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="h-px flex-1" style={{ background: "linear-gradient(to right, rgba(139,92,246,0.4), transparent)" }} />
                </div>
                <h1 className="text-white text-2xl font-black tracking-tight leading-none mb-2">
                  Welcome back
                </h1>
                <p className="text-zinc-500 text-[13px] leading-relaxed">
                  Sign in to your admin account to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error */}
                {error && (
                  <div
                    className="flex items-start gap-3 rounded-xl px-4 py-3 slide-up-1"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}
                  >
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <p className="text-[13px] text-red-400 font-medium">{error}</p>
                  </div>
                )}

                {/* Email */}
                <div className="slide-up-3">
                  <label className="block text-[11px] font-bold text-zinc-500 mb-2 tracking-widest uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      placeholder="admin@shajsutro.com"
                      className="input-dark w-full pl-10 pr-4 py-3.5 rounded-xl text-[13px]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="slide-up-4">
                  <label className="block text-[11px] font-bold text-zinc-500 mb-2 tracking-widest uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      className="input-dark w-full pl-10 pr-12 py-3.5 rounded-xl text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors duration-150"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="slide-up-5 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-glow w-full py-3.5 rounded-xl text-white text-[13px] font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                    style={{
                      background: submitting
                        ? "linear-gradient(135deg, #6d28d9, #4338ca)"
                        : "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)",
                    }}
                  >
                    {submitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Authenticating…
                      </>
                    ) : (
                      <>
                        Sign In to Console
                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 mt-6">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-zinc-700 text-[10px] font-semibold tracking-wider uppercase">Secure</span>
                </div>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              <p className="text-center text-zinc-700 text-[11px] mt-4 leading-relaxed">
                Admin access only — all sign-in attempts are logged<br />and monitored for security.
              </p>
            </div>

            {/* Version tag */}
            <div className="flex items-center justify-center gap-2 mt-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-700 text-[10px] font-medium tracking-wide">Systems operational · v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
