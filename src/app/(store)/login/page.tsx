"use client";

import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { getApiBase } from "@/lib/apiBase";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/notify";

type View = "tabs" | "verify-email" | "forgot-password";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || searchParams.get("from") || "/profile";
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<View>("tabs");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const isCheckoutRedirect = redirectUrl.includes("checkout");

  return (
    <div className="min-h-screen bg-[#faf8f5] relative overflow-x-clip flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans selection:bg-emerald-900 selection:text-white">
      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />

      {/* Atmospheric Luxury Ambient Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-900/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Luxury Frame */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_30px_90px_rgba(10,35,24,0.06)] border border-stone-200/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 min-h-[640px]">
        
        {/* ─── Left Editorial Visual Canvas (High Fashion & Heritage) ─── */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-stone-900 text-white select-none">
          {/* Background Visual with Rich Editorial Lighting */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85"
              alt="ShajSutro Haute Couture"
              className="w-full h-full object-cover object-center opacity-65 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061e14]/95 via-[#061e14]/60 to-black/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
          </div>

          {/* Top Brand Monogram */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wider text-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Haute Elegance • Atelier
            </div>
          </div>

          {/* Centerpiece Editorial Quote */}
          <div className="relative z-10 my-auto py-8">
            <span className="text-amber-300 text-4xl font-serif leading-none block mb-2">&ldquo;</span>
            <h2 className="text-2xl xl:text-3xl font-serif tracking-tight leading-snug text-stone-100 font-light italic">
              Where timeless Bengali craftsmanship meets modern sophistication.
            </h2>
            <p className="mt-4 text-xs font-light text-stone-300 tracking-normal">
              Curated Wardrobe • Verified Fabrics • Express Delivery
            </p>
          </div>

          {/* Bottom Floating Glass Review Pill */}
          <div className="relative z-10 pt-6 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex text-amber-300 text-xs tracking-widest">★★★★★</div>
                <span className="text-xs text-emerald-200 font-medium tracking-wide">Verified Patron</span>
              </div>
              <p className="text-xs text-stone-200 font-light italic leading-relaxed">
                &ldquo;The fabric texture and fit are exceptional. It feels luxurious from the moment you wear it.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Aesthetic Form Experience ─── */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white relative">
          
          <div>
            {/* Minimal Brand Identity & Context */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
              <div>
                <Link href="/" className="inline-block group">
                  <span className="text-xl font-bold tracking-[0.18em] uppercase text-emerald-950 font-serif">
                    SHAJSUTRO<span className="text-amber-600 font-sans text-sm ml-0.5">.</span>
                  </span>
                </Link>
                <p className="text-xs tracking-wider uppercase text-stone-500 font-medium mt-0.5">
                  Exclusive Member Portal
                </p>
              </div>

              {view === "tabs" && (
                <div className="flex items-center p-1 bg-stone-100/80 rounded-full border border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                      activeTab === "login"
                        ? "bg-emerald-950 text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                      activeTab === "register"
                        ? "bg-emerald-950 text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Special Checkout Notice Ribbon */}
            {isCheckoutRedirect && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center gap-3.5 text-stone-900 shadow-xs">
                <span className="w-9 h-9 rounded-xl bg-emerald-950 text-amber-300 flex items-center justify-center flex-shrink-0 text-sm shadow-xs">
                  🛍️
                </span>
                <div>
                  <p className="text-xs font-bold text-emerald-950 tracking-tight">Checkout Access Required</p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Sign in or create an account to proceed with your saved cart.
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic View Header with Semantic H1 for accessibility */}
            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-emerald-950">
                {view === "forgot-password"
                  ? "Recover your account"
                  : view === "verify-email"
                  ? "Confirm your email"
                  : activeTab === "login"
                  ? "Welcome back"
                  : "Create your wardrobe account"}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-light mt-1.5">
                {view === "forgot-password"
                  ? "Enter your email to receive an instant verification code."
                  : view === "verify-email"
                  ? "We sent a 6-digit confirmation code to your inbox."
                  : activeTab === "login"
                  ? "Access your curated wishlist, past orders, and tailored sizing."
                  : "Join today for private drop access, bespoke styling, and rapid checkout."}
              </p>
            </div>

            {/* Form Switching Container */}
            <div>
              {view === "verify-email" && pendingEmail ? (
                <VerifyEmailForm
                  email={pendingEmail}
                  redirectUrl={redirectUrl}
                  onVerified={() => {
                    setView("tabs");
                    setActiveTab("login");
                    setPendingEmail(null);
                  }}
                  onBack={() => {
                    setView("tabs");
                    setPendingEmail(null);
                  }}
                />
              ) : view === "forgot-password" ? (
                <ForgotPasswordFlow
                  onBack={() => setView("tabs")}
                  onDone={() => {
                    setView("tabs");
                    setActiveTab("login");
                  }}
                />
              ) : activeTab === "login" ? (
                <LoginForm
                  redirectUrl={redirectUrl}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  onForgotPassword={() => setView("forgot-password")}
                />
              ) : (
                <RegisterForm
                  redirectUrl={redirectUrl}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  onRegistered={(email) => {
                    setPendingEmail(email);
                    setView("verify-email");
                  }}
                />
              )}
            </div>
          </div>

          {/* Minimalist Bottom Footer */}
          <div className="mt-10 pt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-light">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-medium text-stone-600 hover:text-emerald-950 transition-colors group"
            >
              <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
              </svg>
              Explore Collection
            </Link>

            <span className="text-xs text-stone-500 font-medium tracking-normal">
              256-bit Encrypted
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}

// ─── Aesthetic Social Login ───────────────────────────────────────────────────

function SocialButtons({ redirectUrl = "/profile" }: { redirectUrl?: string }) {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const ensureGoogleScript = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const g = typeof window !== "undefined" ? (window as any).google : null;
      if (g?.accounts?.oauth2) return resolve(g);
      const existing = document.getElementById("google-jssdk");
      if (existing) {
        existing.addEventListener("load", () => resolve((window as any).google));
        existing.addEventListener("error", () => reject(new Error("Failed to load Google SDK")));
        return;
      }
      const script = document.createElement("script");
      script.id = "google-jssdk";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(() => resolve((window as any).google), 150);
      };
      script.onerror = () => reject(new Error("Failed to load Google SDK script"));
      document.head.appendChild(script);
    });
  };

  const handleGoogleLogin = async () => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "30233845656-lmb96sgoph6u4ug4olhedr5bmcfp5jr8.apps.googleusercontent.com";

    try {
      setGoogleLoading(true);
      const google = await ensureGoogleScript();
      if (!google?.accounts?.oauth2) {
        notifyError("Google Sign-In is unavailable. Please try again in a moment.");
        setGoogleLoading(false);
        return;
      }

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "email profile",
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            notifyError("Google authentication failed. Please try again.");
            setGoogleLoading(false);
            return;
          }

          const accessToken = tokenResponse.access_token;
          if (!accessToken) {
            notifyError("Google did not return an access token.");
            setGoogleLoading(false);
            return;
          }

          try {
            const apiBase = getApiBase();
            const res = await fetch(`${apiBase}/api/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accessToken }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message ?? "Google login failed");

            localStorage.setItem("token", data.token);
            notifySuccess("Logged in with Google successfully!");
            router.push(redirectUrl);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Google login failed";
            notifyError(message);
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (err) {
      notifyError("An error occurred starting Google Sign-In.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <button
        type="button"
        disabled={googleLoading}
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-100 hover:border-stone-300 text-xs font-semibold text-stone-800 transition-all duration-200 disabled:opacity-60 active:scale-[0.98]"
      >
        {googleLoading ? (
          <div className="w-3.5 h-3.5 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Google
      </button>

      <button
        type="button"
        onClick={() => notifyInfo("Apple ID login is coming soon.")}
        className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-100 hover:border-stone-300 text-xs font-semibold text-stone-800 transition-all duration-200 active:scale-[0.98]"
      >
        <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
        Apple
      </button>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative flex items-center gap-4 mb-6">
      <div className="flex-1 h-px bg-stone-200/70" />
      <span className="text-xs text-stone-500 font-medium tracking-wide uppercase">
        or continue with email
      </span>
      <div className="flex-1 h-px bg-stone-200/70" />
    </div>
  );
}

// ─── Minimal Luxury Login Form ─────────────────────────────────────────────────

function LoginForm({
  redirectUrl = "/profile",
  showPassword,
  setShowPassword,
  onForgotPassword,
}: {
  redirectUrl?: string;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onForgotPassword: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please complete all fields.");
      notifyError("Please complete all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Login failed");
      localStorage.setItem("token", data.token);
      notifySuccess("Welcome back!");
      router.push(redirectUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SocialButtons redirectUrl={redirectUrl} />
      <Divider />

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wide uppercase text-stone-600">
          Email Address
        </label>
        <input
          type="email"
          className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-950 focus:ring-4 focus:ring-emerald-950/5 transition-all"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold tracking-wide uppercase text-stone-600">
            Password
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-medium text-emerald-950 hover:underline tracking-wide"
          >
            Forgot?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 py-3.5 pr-11 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-950 focus:ring-4 focus:ring-emerald-950/5 transition-all"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="remember"
          defaultChecked
          className="w-4 h-4 rounded border-stone-300 text-emerald-950 focus:ring-emerald-900"
        />
        <label htmlFor="remember" className="text-xs text-stone-500 font-light cursor-pointer select-none">
          Remember my credentials on this device
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[50px] py-3.5 bg-emerald-950 hover:bg-[#072418] text-white font-medium tracking-wide text-xs sm:text-sm rounded-2xl shadow-[0_10px_25px_rgba(6,30,20,0.15)] hover:shadow-[0_15px_35px_rgba(6,30,20,0.22)] transition-all active:scale-[0.99] disabled:opacity-60 mt-3"
      >
        {loading ? <Spinner /> : "Sign In to Portal"}
      </button>
    </form>
  );
}

// ─── Minimal Luxury Register Form ──────────────────────────────────────────────

function RegisterForm({
  redirectUrl = "/profile",
  showPassword,
  setShowPassword,
  onRegistered,
}: {
  redirectUrl?: string;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onRegistered: (email: string) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName || !email || !password) {
      setError("Please fill in all required fields.");
      notifyError("Please fill in all required fields.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms of Service.");
      notifyError("Please accept the Terms of Service.");
      return;
    }
    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      const res = await fetch(`${getApiBase()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Registration failed");
      notifyInfo("Account registered. Check your email for verification.");
      onRegistered(email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SocialButtons redirectUrl={redirectUrl} />
      <Divider />

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold tracking-wide uppercase text-stone-600">
            First Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-950 focus:ring-4 focus:ring-emerald-950/5 transition-all"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold tracking-wide uppercase text-stone-600">
            Last Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-950 focus:ring-4 focus:ring-emerald-950/5 transition-all"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wide uppercase text-stone-600">
          Email Address <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-950 focus:ring-4 focus:ring-emerald-950/5 transition-all"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wide uppercase text-stone-600">
          Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 py-3.5 pr-11 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-950 focus:ring-4 focus:ring-emerald-950/5 transition-all"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 rounded border-stone-300 text-emerald-950 focus:ring-emerald-900"
        />
        <label htmlFor="terms" className="text-xs text-stone-500 font-light cursor-pointer select-none">
          I accept the <span className="text-emerald-950 font-medium underline">Terms of Service</span> & <span className="text-emerald-950 font-medium underline">Privacy Policy</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[50px] py-3.5 bg-emerald-950 hover:bg-[#072418] text-white font-medium tracking-wide text-xs sm:text-sm rounded-2xl shadow-[0_10px_25px_rgba(6,30,20,0.15)] hover:shadow-[0_15px_35px_rgba(6,30,20,0.22)] transition-all active:scale-[0.99] disabled:opacity-60 mt-3"
      >
        {loading ? <Spinner /> : "Create Member Account"}
      </button>
    </form>
  );
}

// ─── Forgot Password Flow ──────────────────────────────────────────────────────

type FPStep = "email" | "otp" | "new-password";

function ForgotPasswordFlow({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState<FPStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  return (
    <>
      {step === "email" && (
        <FPStepEmail
          onSent={(e) => {
            setEmail(e);
            setStep("otp");
          }}
          onBack={onBack}
        />
      )}
      {step === "otp" && (
        <FPStepOTP
          email={email}
          onVerified={(c) => {
            setCode(c);
            setStep("new-password");
          }}
          onBack={() => setStep("email")}
        />
      )}
      {step === "new-password" && (
        <FPStepNewPassword
          email={email}
          code={code}
          onDone={onDone}
          onBack={() => setStep("otp")}
        />
      )}
    </>
  );
}

function FPStepEmail({
  onSent,
  onBack,
}: {
  onSent: (email: string) => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email.");
      notifyError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to send reset code");
      notifySuccess("Reset code dispatched.");
      onSent(email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wide uppercase text-stone-600">
          Account Email Address
        </label>
        <input
          type="email"
          className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-950 focus:ring-4 focus:ring-emerald-950/5 transition-all"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[50px] py-3.5 bg-emerald-950 hover:bg-[#072418] text-white font-medium tracking-wide text-xs sm:text-sm rounded-2xl shadow-[0_10px_25px_rgba(6,30,20,0.15)] transition-all active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? <Spinner /> : "Dispatch 6-Digit Code"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-xs font-semibold text-stone-600 hover:text-emerald-950 transition-colors py-1 inline-flex items-center justify-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Return to Sign In
      </button>
    </form>
  );
}

function FPStepOTP({
  email,
  onVerified,
  onBack,
}: {
  email: string;
  onVerified: (code: string) => void;
  onBack: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      onVerified(code);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await fetch(`${getApiBase()}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCooldown(60);
      setDigits(Array(6).fill(""));
      notifySuccess("A new reset code has been sent.");
      inputRefs.current[0]?.focus();
    } catch {
      /* silent */
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-700 font-medium text-center">
          {error}
        </div>
      )}

      {/* 6 Individual High-Contrast Code Boxes */}
      <div className="flex justify-center gap-2 sm:gap-3 py-2" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-2xl border-2 outline-none transition-all duration-200 shadow-sm ${
              digit
                ? "border-emerald-950 bg-emerald-50/90 text-emerald-950 shadow-md scale-105"
                : "border-emerald-300/80 bg-emerald-50/30 text-emerald-950 hover:border-emerald-400 hover:bg-emerald-50/60"
            } focus:border-emerald-950 focus:bg-white focus:ring-4 focus:ring-emerald-950/15 focus:scale-105`}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[50px] py-3.5 bg-emerald-950 hover:bg-[#072418] text-white font-medium tracking-wide text-xs sm:text-sm rounded-2xl shadow-[0_10px_25px_rgba(6,30,20,0.15)] transition-all active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? <Spinner /> : "Confirm Security Code"}
      </button>

      <div className="flex items-center justify-between text-xs pt-1">
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-stone-600 hover:text-emerald-950 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="font-medium text-emerald-950 hover:underline transition-colors disabled:text-stone-400 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}

function FPStepNewPassword({
  email,
  code,
  onDone,
  onBack,
}: {
  email: string;
  code: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      notifyError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      notifyError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Reset failed");
      setSuccess("Password reset successfully! Redirecting to Sign In…");
      notifySuccess("Password updated.");
      setTimeout(onDone, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 font-medium">
          {success}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wide uppercase text-stone-600">
          New Password
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            className="w-full px-4 py-3.5 pr-11 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-950 focus:ring-4 focus:ring-emerald-950/5 transition-all"
            placeholder="Min. 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <EyeIcon open={show} />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wide uppercase text-stone-600">
          Confirm Password
        </label>
        <input
          type={show ? "text" : "password"}
          className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-950 focus:ring-4 focus:ring-emerald-950/5 transition-all"
          placeholder="Repeat new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !!success}
        className="w-full min-h-[50px] py-3.5 bg-emerald-950 hover:bg-[#072418] text-white font-medium tracking-wide text-xs sm:text-sm rounded-2xl shadow-[0_10px_25px_rgba(6,30,20,0.15)] transition-all active:scale-[0.99] disabled:opacity-60 mt-2"
      >
        {loading ? <Spinner /> : "Update Password"}
      </button>
    </form>
  );
}

// ─── Verify Email Form ─────────────────────────────────────────────────────────

function VerifyEmailForm({
  email,
  redirectUrl = "/profile",
  onVerified,
  onBack,
}: {
  email: string;
  redirectUrl?: string;
  onVerified: () => void;
  onBack: () => void;
}) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      notifyError("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Verification failed");
      if (data.token) localStorage.setItem("token", data.token);
      setSuccess("Email verified! Redirecting…");
      notifySuccess("Email verified successfully!");
      setTimeout(() => {
        onVerified();
        router.push(redirectUrl);
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${getApiBase()}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to resend");
      setSuccess("A new code has been sent to your email.");
      notifySuccess("Verification code resent.");
      setCooldown(60);
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      notifyError(message);
    }
  }, [email]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-700 font-medium text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 font-medium text-center">
          {success}
        </div>
      )}

      {/* 6 Individual High-Contrast Code Boxes */}
      <div className="flex justify-center gap-2 sm:gap-3 py-2" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-2xl border-2 outline-none transition-all duration-200 shadow-sm ${
              digit
                ? "border-emerald-950 bg-emerald-50/90 text-emerald-950 shadow-md scale-105"
                : "border-emerald-300/80 bg-emerald-50/30 text-emerald-950 hover:border-emerald-400 hover:bg-emerald-50/60"
            } focus:border-emerald-950 focus:bg-white focus:ring-4 focus:ring-emerald-950/15 focus:scale-105`}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || !!success}
        className="w-full min-h-[50px] py-3.5 bg-emerald-950 hover:bg-[#072418] text-white font-medium tracking-wide text-xs sm:text-sm rounded-2xl shadow-[0_10px_25px_rgba(6,30,20,0.15)] transition-all active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? <Spinner /> : "Verify & Sign In"}
      </button>

      <div className="flex items-center justify-between text-xs pt-1">
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-stone-600 hover:text-emerald-950 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="font-medium text-emerald-950 hover:underline transition-colors disabled:text-stone-400 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}

// ─── Shared UI Helpers ─────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {open ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      )}
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin mx-auto h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
