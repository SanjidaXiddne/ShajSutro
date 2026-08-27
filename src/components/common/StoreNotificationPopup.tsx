"use client";

import { useEffect, useState } from "react";
import { getApiBase } from "@/lib/apiBase";
import Link from "next/link";

interface NotificationItem {
  _id: string;
  title?: string;
  message?: string;
  type: "discount" | "special_offer" | "announcement" | "product_discount";
  image?: string;
  link?: string;
  promoCode?: string;
  duration?: number;
  isActive: boolean;
  createdAt: string;
}

function CopyPromoButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
      title="Click to copy promo code"
    >
      <span className="text-[10px] uppercase font-sans font-bold text-amber-700">Code:</span>
      <span className="tracking-wider text-amber-950 font-black text-sm">{code}</span>
      <span className="text-xs font-sans font-bold ml-1 text-violet-700">
        {copied ? "✓ Copied!" : "📋 Copy"}
      </span>
    </button>
  );
}

const TYPE_CONFIG: Record<
  NotificationItem["type"],
  { badge: string; badgeBg: string; icon: string; btnBg: string; accentColor: string }
> = {
  special_offer: {
    badge: "EXCLUSIVE OFFER",
    badgeBg: "bg-amber-500/10 text-amber-700 border-amber-300/60",
    icon: "⚡",
    btnBg: "bg-charcoal-950 text-white hover:bg-charcoal-800 shadow-xl shadow-charcoal-950/20",
    accentColor: "from-amber-500 to-orange-500",
  },
  discount: {
    badge: "LIMITED DISCOUNT",
    badgeBg: "bg-rose-500/10 text-rose-700 border-rose-300/60",
    icon: "🎁",
    btnBg: "bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-600/25",
    accentColor: "from-rose-500 to-pink-500",
  },
  product_discount: {
    badge: "SPECIAL DEAL",
    badgeBg: "bg-indigo-500/10 text-indigo-700 border-indigo-300/60",
    icon: "🏷️",
    btnBg: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/25",
    accentColor: "from-indigo-500 to-purple-500",
  },
  announcement: {
    badge: "ANNOUNCEMENT",
    badgeBg: "bg-sky-500/10 text-sky-700 border-sky-300/60",
    icon: "📢",
    btnBg: "bg-charcoal-950 text-white hover:bg-charcoal-800 shadow-xl shadow-charcoal-950/20",
    accentColor: "from-sky-500 to-blue-500",
  },
};

export default function StoreNotificationPopup() {
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const fetchActiveNotification = async () => {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/notifications/active`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const latest: NotificationItem = json.data[0];
          setNotification(latest);
          setTimeout(() => {
            setVisible(true);
          }, 350);
        }
      } catch {
        // Silently ignore if backend offline
      }
    };

    fetchActiveNotification();
  }, []);

  useEffect(() => {
    if (!visible || !notification) return;

    const durationSeconds =
      notification.duration && notification.duration > 0
        ? notification.duration
        : 6;

    const timer = setTimeout(() => {
      handleClose();
    }, durationSeconds * 1000);

    return () => clearTimeout(timer);
  }, [visible, notification]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
    }, 250);
  };

  if (!visible || !notification) return null;

  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.special_offer;
  const durationSec = notification.duration || 6;
  const hasImage = Boolean(notification.image);
  const hasText = Boolean(notification.title?.trim() || notification.message?.trim());
  const code = notification.promoCode?.trim() || (notification.message ? (notification.message.match(/\b([A-Z0-9]{4,15})\b/i)?.[1]?.toUpperCase() ?? null) : null);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Light Soft Blurred Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Modern Card Modal Container */}
      <div
        className={`relative w-full max-w-md bg-white text-charcoal-950 rounded-[2.25rem] shadow-2xl overflow-hidden border border-charcoal-100 z-10 transition-all duration-300 transform ${
          closing
            ? "opacity-0 scale-95 translate-y-4"
            : "opacity-100 scale-100 translate-y-0 animate-in zoom-in-95"
        }`}
      >
        {/* Animated Countdown Top Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-charcoal-100 overflow-hidden z-30">
          <div
            className={`h-full bg-gradient-to-r ${config.accentColor}`}
            style={{
              animation: `shrinkWidth ${durationSec}s linear forwards`,
            }}
          />
        </div>

        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close notification modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-charcoal-500 hover:text-charcoal-950 border border-charcoal-200/80 transition-all duration-200 flex items-center justify-center z-30 shadow-md backdrop-blur-xs group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* IMAGE ONLY MODE */}
        {hasImage && !hasText && (
          <div className="relative w-full bg-charcoal-950 overflow-hidden flex flex-col">
            {notification.link ? (
              notification.link.startsWith("http") ? (
                <a
                  href={notification.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleClose}
                  className="block relative w-full group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={notification.image}
                    alt="Offer notification"
                    className="w-full h-auto max-h-[75vh] object-contain mx-auto transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="p-4 bg-white/95 backdrop-blur-sm border-t border-charcoal-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900">Tap to explore offer</span>
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md ${config.btnBg}`}>
                      Explore
                    </span>
                  </div>
                </a>
              ) : (
                <Link
                  href={notification.link}
                  onClick={handleClose}
                  className="block relative w-full group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={notification.image}
                    alt="Offer notification"
                    className="w-full h-auto max-h-[75vh] object-contain mx-auto transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="p-4 bg-white/95 backdrop-blur-sm border-t border-charcoal-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900">Tap to explore offer</span>
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md ${config.btnBg}`}>
                      Explore
                    </span>
                  </div>
                </Link>
              )
            ) : (
              <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={notification.image}
                  alt="Offer notification"
                  className="w-full h-auto max-h-[75vh] object-contain mx-auto"
                />
              </div>
            )}
          </div>
        )}

        {/* IMAGE BANNER (WITH TEXT BELOW) */}
        {hasImage && hasText && (
          <div className="relative w-full h-52 sm:h-60 bg-charcoal-50 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={notification.image}
              alt={notification.title || "Offer notification"}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
            <div className="absolute bottom-3 left-6">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 text-[10px] font-extrabold tracking-widest rounded-full border backdrop-blur-md shadow-sm ${config.badgeBg}`}>
                <span>{config.icon}</span>
                <span>{config.badge}</span>
              </span>
            </div>
          </div>
        )}

        {/* TEXT ONLY HEADER */}
        {!hasImage && (
          <div className="relative w-full pt-8 pb-6 bg-gradient-to-br from-warm-50 via-warm-100/50 to-white flex flex-col items-center justify-center text-center px-6 border-b border-charcoal-100/60">
            <div className="w-14 h-14 rounded-2xl bg-white border border-charcoal-150 flex items-center justify-center text-2xl mb-3 shadow-soft">
              {config.icon}
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 text-[10px] font-extrabold tracking-widest rounded-full border backdrop-blur-md ${config.badgeBg}`}>
              <span>{config.badge}</span>
            </span>
          </div>
        )}

        {/* Content Body (For Text Only or Image+Text) */}
        {hasText && (
          <div className="p-6 sm:p-7 relative z-10 text-left">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent-600 mb-1">
              ShajSutro Offer
            </p>

            {notification.title && (
              <h3 className="text-xl font-bold text-charcoal-950 tracking-tight leading-snug">
                {notification.title}
              </h3>
            )}

            {notification.message && (
              <p className="text-xs sm:text-sm text-charcoal-500 mt-2 leading-relaxed font-light">
                {notification.message}
              </p>
            )}

            {/* Action CTA Button */}
            {notification.link && (
              <div className="mt-6">
                {notification.link.startsWith("http") ? (
                  <a
                    href={notification.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleClose}
                    className={`w-full py-3.5 px-6 rounded-2xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group ${config.btnBg}`}
                  >
                    <span>Explore Offer</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                ) : (
                  <Link
                    href={notification.link}
                    onClick={handleClose}
                    className={`w-full py-3.5 px-6 rounded-2xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group ${config.btnBg}`}
                  >
                    <span>Explore Offer</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
