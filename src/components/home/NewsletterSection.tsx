"use client";

import { getApiBase } from "@/lib/apiBase";
import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) return;
    
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`${getApiBase()}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to subscribe");
      }
      setStatus("success");
      setEmail("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to subscribe. Please try again.");
      setStatus("error");
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-[#0c0d0e] overflow-hidden relative border-t border-white/[0.06]">
      {/* High-end OLED backlight ambient glows */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative subtle dot mesh backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1.5px,transparent_1.5px)] [background-size:28px_28px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center z-10">
        
        {/* Sleek Line Envelope Icon Container */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-white/[0.01] border border-white/15 flex items-center justify-center mb-3.5 shadow-xl transition-all duration-300 hover:scale-105 select-none">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Headings */}
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Newsletter
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-serif italic text-white mb-2 tracking-normal leading-tight font-normal text-center">
          Stay in the Loop
        </h2>
        
        <p className="text-gray-400 mb-5 text-xs sm:text-sm leading-relaxed font-light max-w-md text-center">
          Subscribe to our newsletter for early access to drops, private sale alerts, and minimalist style guides.
        </p>

        {/* Form and state triggers */}
        {status === "success" ? (
          <div className="relative group w-full max-w-md mx-auto">
            {/* Ambient emerald backlight glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-emerald-500/30 rounded-3xl blur-xl opacity-70 animate-pulse" />
            
            <div className="relative flex flex-col items-center justify-center p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#11241c] via-[#0d1c16] to-[#0a1510] border border-emerald-500/40 text-center shadow-2xl backdrop-blur-xl space-y-3.5">
              {/* Glowing Emerald Check Icon */}
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0">
                <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  You&apos;re Subscribed! 🎉
                </h3>
                <p className="text-xs text-emerald-300/80 font-light mt-1 max-w-xs leading-relaxed">
                  Welcome to <span className="font-semibold text-white">ShajSutro VIP</span>. Check your inbox for exclusive perks & drops.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setErrorMessage("");
                }}
                className="mt-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4 transition-colors"
              >
                Subscribe another email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto relative group space-y-3">
            {/* Integrated input frame with focus glow */}
            <div className={`relative flex items-center p-1.5 rounded-2xl bg-white/[0.03] border transition-all duration-300 shadow-xl ${
              status === "error"
                ? "border-rose-500/60 ring-4 ring-rose-500/10"
                : "border-white/15 focus-within:border-amber-400/60 focus-within:ring-4 focus-within:ring-amber-400/10"
            }`}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 min-w-0 px-4.5 py-3 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-70 shrink-0 shadow-lg shadow-amber-500/20"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </div>

            {status === "error" && errorMessage && (
              <p className="text-center text-xs text-rose-400 font-medium animate-fade-in">
                ⚠️ {errorMessage}
              </p>
            )}
          </form>
        )}

        <p className="mt-7 text-xs text-gray-400 font-light text-center">
          By subscribing, you agree to our{" "}
          <a href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors duration-300 underline underline-offset-4 font-normal">
            Privacy Policy
          </a>
          . Unsubscribe at any time.
        </p>

        {/* Curated benefits drawer */}
        <div className="mt-14 pt-7 border-t border-white/[0.06] w-full flex flex-wrap justify-center gap-x-8 gap-y-4 text-[11px] sm:text-xs text-gray-500">
          {[
            "Early Access to Drops",
            "Private Subscriber Offers",
            "Minimalist Style Guides",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-light tracking-wide text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
