"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiBase } from "@/lib/apiBase";

interface BannerNotification {
  _id: string;
  title?: string;
  message?: string;
  type: string;
  image?: string;
  link?: string;
  buttonText?: string;
  badgeText?: string;
  promoCode?: string;
  isActive: boolean;
}

export default function PromoBanner() {
  const [banner, setBanner] = useState<BannerNotification | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${getApiBase()}/api/notifications/active`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Priority: hero_banner > first active notification
          const heroItem =
            data.data.find((n: BannerNotification) => n.type === "hero_banner") ||
            data.data[0];
          setBanner(heroItem);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeText = banner?.badgeText || "LIMITED SEASON RELEASE";
  const title = banner?.title || "Up to 40% off";
  const message =
    banner?.message ||
    "On select seasonal styles. Apply the limited release code at checkout:";
  const promoCode = banner?.promoCode || "SPRING25";
  const buttonText = banner?.buttonText || "Shop The Sale";
  const linkUrl = banner?.link || "/shop?badge=Sale";
  const posterImage =
    banner?.image ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop";

  return (
    <section className="relative w-full overflow-hidden bg-charcoal-950 py-16 sm:py-20 lg:py-24 border-y border-charcoal-900 shadow-2xl group">
      {/* Full-Width Poster Image Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <img
          src={posterImage}
          alt={title}
          className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        {/* Full-width gradient overlays for text readability and premium aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/95 via-charcoal-950/80 to-charcoal-950/40 sm:from-charcoal-950/95 sm:via-charcoal-950/70 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-charcoal-950/30" />
      </div>

      {/* High-end OLED Glow Accents */}
      <div className="absolute top-[-30%] left-[-10%] w-[450px] h-[450px] bg-accent-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[5%] w-[450px] h-[450px] bg-warm-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Dotted mesh grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12">
          {/* Main Poster Content */}
          <div className="text-left space-y-4 max-w-2xl">
            {badgeText && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                <span className="text-xs font-semibold text-accent-300 uppercase tracking-wider">
                  {badgeText}
                </span>
              </div>
            )}

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-charcoal-200 text-sm sm:text-base lg:text-lg font-light leading-relaxed max-w-xl">
              {message}
              {promoCode && (
                <button
                  type="button"
                  onClick={() => handleCopyCode(promoCode)}
                  title="Click to copy promo code"
                  className="inline-flex items-center gap-1.5 ml-2 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 font-mono text-xs font-bold text-white shadow-md transition-all hover:bg-white/20 hover:border-white/40 active:scale-95"
                >
                  <svg
                    className="w-3.5 h-3.5 text-accent-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{promoCode}</span>
                  {copied ? (
                    <span className="text-[10px] text-emerald-400 font-bold uppercase ml-1">
                      Copied!
                    </span>
                  ) : (
                    <span className="text-[9px] text-charcoal-300 uppercase ml-1">
                      Copy
                    </span>
                  )}
                </button>
              )}
            </p>
          </div>

          {/* Action CTA Button */}
          <div className="flex-shrink-0 relative group/btn pt-2 lg:pt-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-500 to-warm-400 rounded-full blur-md opacity-40 group-hover/btn:opacity-90 transition duration-500 pointer-events-none" />

            <Link
              href={linkUrl}
              className="relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-4.5 bg-white text-charcoal-950 font-extrabold text-sm sm:text-base rounded-full transition-all duration-300 hover:scale-[1.03] hover:bg-warm-50 shadow-2xl"
            >
              <span>{buttonText}</span>
              <svg
                className="w-4 h-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
