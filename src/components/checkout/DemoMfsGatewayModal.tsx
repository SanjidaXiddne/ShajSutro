"use client";

import React, { useState, useEffect } from "react";

interface DemoMfsGatewayModalProps {
  isOpen: boolean;
  method: "bkash" | "nagad" | "rocket" | "";
  amount: number;
  onSuccess: (txnId: string, accountNumber: string) => void;
  onClose: () => void;
}

export default function DemoMfsGatewayModal({
  isOpen,
  method,
  amount,
  onSuccess,
  onClose,
}: DemoMfsGatewayModalProps) {
  const [step, setStep] = useState<"number" | "otp" | "pin" | "processing" | "success">("number");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState("");
  const [generatedTxnId, setGeneratedTxnId] = useState("");
  const [copied, setCopied] = useState(false);

  // Reset modal state when method changes or opens
  useEffect(() => {
    if (isOpen) {
      setStep("number");
      setPhone("01712345678");
      setOtp("");
      setPin("");
      setError("");
      setAgreed(true);
      setGeneratedTxnId("");
      setCopied(false);
    }
  }, [isOpen, method]);

  if (!isOpen || !method) return null;

  const brand = {
    bkash: {
      name: "bKash",
      fullName: "bKash Payment Gateway",
      tagline: "Fast & Secure Payment",
      bgColor: "bg-[#E2136E]",
      borderColor: "border-[#E2136E]",
      textColor: "text-[#E2136E]",
      hoverBg: "hover:bg-[#c40f5f]",
      lightBg: "bg-[#fce7f0]",
      glowColor: "shadow-[#E2136E]/25",
      accentGradient: "from-[#E2136E] via-[#d60e65] to-[#990847]",
      prefix: "BK",
      helpPhone: "16247",
      logoPath: "/images/bkash.jpg",
    },
    nagad: {
      name: "Nagad",
      fullName: "Nagad Online Payment",
      tagline: "Dak Vibhag's Digital Financial Service",
      bgColor: "bg-[#F05A28]",
      borderColor: "border-[#F05A28]",
      textColor: "text-[#F05A28]",
      hoverBg: "hover:bg-[#d84a1e]",
      lightBg: "bg-[#fff0ea]",
      glowColor: "shadow-[#F05A28]/25",
      accentGradient: "from-[#F05A28] via-[#e24e1c] to-[#b33509]",
      prefix: "NG",
      helpPhone: "16167",
      logoPath: "/images/Nagad.png",
    },
    rocket: {
      name: "Rocket",
      fullName: "DBBL Rocket Payment",
      tagline: "Dutch-Bangla Bank Mobile Banking",
      bgColor: "bg-[#8C3494]",
      borderColor: "border-[#8C3494]",
      textColor: "text-[#8C3494]",
      hoverBg: "hover:bg-[#782b7f]",
      lightBg: "bg-[#f8ebfc]",
      glowColor: "shadow-[#8C3494]/25",
      accentGradient: "from-[#8C3494] via-[#7d2b85] to-[#55165c]",
      prefix: "RK",
      helpPhone: "16216",
      logoPath: "/images/rocket.jpg",
    },
  }[method];

  const handleNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      setError("Please enter a valid 11-digit mobile number");
      return;
    }
    setError("");
    setStep("otp");
    setOtp("123456");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError("Please enter the 6-digit verification code");
      return;
    }
    setError("");
    setStep("pin");
    setPin("12345");
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setError("Please enter your 5-digit PIN");
      return;
    }
    setError("");
    setStep("processing");

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomPart = "";
    for (let i = 0; i < 8; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newTxnId = `${brand.prefix}${randomPart}`;
    setGeneratedTxnId(newTxnId);

    setTimeout(() => {
      setStep("success");
    }, 1400);
  };

  const handleCopyTxnId = () => {
    if (generatedTxnId) {
      navigator.clipboard.writeText(generatedTxnId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFinish = () => {
    onSuccess(generatedTxnId, phone);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col transition-all my-auto max-h-[92vh]">

        {/* ── STUNNING BRANDED HEADER ── */}
        <div className={`p-4 sm:p-5 text-white bg-gradient-to-br ${brand.accentGradient} relative flex flex-col justify-between overflow-hidden shadow-lg shrink-0`}>
          {/* Decorative background glow circle */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/90 hover:text-white transition-all backdrop-blur-sm z-10"
            title="Close Gateway"
          >
            ✕
          </button>

          {/* Top Brand Info */}
          <div className="flex items-center justify-between mb-3 pr-8">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-md shrink-0 border border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brand.logoPath} alt={brand.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight text-white">{brand.name}</h2>
                <p className="text-[10px] sm:text-[11px] text-white/80 font-medium">{brand.tagline}</p>
              </div>
            </div>
          </div>

          {/* Translucent Order Details Card */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-white/20 flex items-center justify-between shadow-inner">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                <svg className="w-3 h-3 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Verified Merchant
              </div>
              <p className="text-xs sm:text-sm font-black text-white">ShajSutro Official Store</p>
              <p className="text-[10px] text-white/70 font-mono">Invoice: INV-{(Date.now() % 100000).toString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-white/80 font-bold tracking-wider">Amount</p>
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight">৳{amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* ── STEP PROGRESS BAR ── */}
        <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200/60 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400 shrink-0">
          <span className={`flex items-center gap-1 ${step === "number" ? brand.textColor : "text-emerald-600"}`}>
            1. Number {step !== "number" && "✓"}
          </span>
          <span>➔</span>
          <span className={`flex items-center gap-1 ${step === "otp" ? brand.textColor : ["pin", "processing", "success"].includes(step) ? "text-emerald-600" : ""}`}>
            2. OTP {["pin", "processing", "success"].includes(step) && "✓"}
          </span>
          <span>➔</span>
          <span className={`flex items-center gap-1 ${step === "pin" ? brand.textColor : ["processing", "success"].includes(step) ? "text-emerald-600" : ""}`}>
            3. PIN {["processing", "success"].includes(step) && "✓"}
          </span>
          <span>➔</span>
          <span className={`flex items-center gap-1 ${step === "success" ? "text-emerald-600" : ""}`}>
            4. Receipt
          </span>
        </div>

        {/* ── MODAL BODY CONTENT ── */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-slate-50/50 overflow-y-auto min-h-[260px]">

          {/* STEP 1: MOBILE NUMBER ENTRY */}
          {step === "number" && (
            <form onSubmit={handleNumberSubmit} className="space-y-5 my-auto">
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Enter Your {brand.name} Number</h3>
                <p className="text-xs text-slate-500 font-light max-w-xs mx-auto">
                  Provide your 11-digit mobile wallet number to connect to {brand.name} demo API.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Mobile Wallet Account
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 01712345678"
                    className={`w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 ${brand.textColor.replace("text-", "focus:ring-")} font-mono text-xl tracking-wider text-slate-900 bg-white font-bold shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setPhone("01712345678")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-sm"
                  >
                    Auto Fill
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-bold text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200">{error}</p>}

              <div className="flex items-center gap-2 pt-1 bg-white p-3 rounded-xl border border-slate-200/80">
                <input
                  type="checkbox"
                  id="mfs-terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                <label htmlFor="mfs-terms" className="text-[11px] text-slate-600 font-medium cursor-pointer">
                  I agree to the terms and conditions of {brand.name} payment gateway.
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!agreed || phone.length < 11}
                  className={`flex-1 py-3.5 px-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all ${brand.bgColor} ${brand.hoverBg} ${brand.glowColor} disabled:opacity-50`}
                >
                  Proceed ➔
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFICATION OTP ENTRY */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-5 my-auto">
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Verification Code (OTP)</h3>
                <p className="text-xs text-slate-500 font-light">
                  Demo SMS code sent to <span className="font-mono font-bold text-slate-800">{phone}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-center">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-center text-2xl tracking-[0.4em] font-extrabold text-slate-900 bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setOtp("123456")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Fill OTP
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-bold text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200">{error}</p>}

              <p className="text-xs text-center text-slate-500 font-medium">
                Demo Code: <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md">123456</span>
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("number")}
                  className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3.5 px-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all ${brand.bgColor} ${brand.hoverBg} ${brand.glowColor}`}
                >
                  Confirm OTP ➔
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PIN ENTRY */}
          {step === "pin" && (
            <form onSubmit={handlePinSubmit} className="space-y-5 my-auto">
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Enter {brand.name} PIN</h3>
                <p className="text-xs text-slate-500 font-light">
                  Enter your {brand.name} account PIN to authorize ৳{amount.toFixed(2)} payment
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-center">
                  Account PIN
                </label>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="password"
                    maxLength={5}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="•••••"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-center text-2xl tracking-[0.5em] font-extrabold text-slate-900 bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setPin("12345")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Fill PIN
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-bold text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200">{error}</p>}

              <p className="text-xs text-center text-slate-500 font-medium">
                Demo PIN: <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md">12345</span>
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("otp")}
                  className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3.5 px-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all ${brand.bgColor} ${brand.hoverBg} ${brand.glowColor}`}
                >
                  Pay ৳{amount.toFixed(2)}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: PROCESSING SPINNER */}
          {step === "processing" && (
            <div className="py-12 text-center space-y-5 my-auto">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className={`w-20 h-20 rounded-full border-4 border-slate-200 border-t-transparent animate-spin`} style={{ borderTopColor: brand.bgColor.replace("bg-[", "").replace("]", "") }} />
                <span className="absolute text-xl font-black text-slate-900">{brand.name[0]}</span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black text-slate-900">Processing Payment...</p>
                <p className="text-xs text-slate-500 font-light max-w-xs mx-auto">
                  Communicating securely with {brand.name} banking server.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS RECEIPT */}
          {step === "success" && (
            <div className="py-4 text-center space-y-5 my-auto animate-fadeIn">
              <div className="relative w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-600/20 border-4 border-emerald-50">
                ✓
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Payment Verified
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">Payment Successful!</h3>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  ৳{amount.toFixed(2)} paid to ShajSutro via {brand.name}
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 text-left space-y-2.5 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 font-medium">Transaction ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-emerald-400 text-sm tracking-wider">{generatedTxnId}</span>
                    <button
                      type="button"
                      onClick={handleCopyTxnId}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-bold transition-colors"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-mono font-semibold text-slate-200">{phone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Paid Amount:</span>
                  <span className="font-black text-emerald-400">৳{amount.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all transform active:scale-95"
              >
                Complete & Place Order ➔
              </button>
            </div>
          )}

          {/* ── FOOTER SECURITY STAMP ── */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              256-bit SSL Encrypted
            </span>
            <span className="font-semibold text-slate-500">Helpline: {brand.helpPhone}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
