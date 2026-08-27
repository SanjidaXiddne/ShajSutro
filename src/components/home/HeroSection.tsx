"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HeroStats = {
  productsCount: number;
  customersCount: number;
  avgRating: number;
};

function formatCompact(n: number) {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K+`;
  return `${n}+`;
}

export default function HeroSection() {
  const [stats, setStats] = useState<HeroStats | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/stats/hero")
      .then((r) => {
        if (!r.ok) throw new Error(`hero stats request failed: ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!alive) return;
        if (json?.success && json?.data) setStats(json.data as HeroStats);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const statItems = useMemo(() => {
    const products = stats ? formatCompact(stats.productsCount) : "120+";
    const customers = stats ? formatCompact(stats.customersCount) : "15K+";
    const rating = stats
      ? `${Math.max(0, Math.min(5, stats.avgRating)).toFixed(1)}★`
      : "4.9★";
    return [
      { value: products, label: "Products" },
      { value: customers, label: "Customers" },
      { value: rating, label: "Rating" },
    ];
  }, [stats]);

  return (
    <section className="relative bg-warm-50 overflow-hidden py-10 lg:py-16">
      {/* Premium Ambient Background Blur Blobs */}
      <div className="absolute top-[15%] left-[-10%] w-[550px] h-[550px] bg-gradient-to-tr from-accent-200/15 to-transparent rounded-full filter blur-[120px] pointer-events-none animate-float" />
      <div
        className="absolute bottom-[10%] right-[-5%] w-[650px] h-[650px] bg-gradient-to-bl from-warm-200/20 to-transparent rounded-full filter blur-[140px] pointer-events-none animate-pulse"
        style={{ animationDuration: "8s" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text content side */}
          <div className="lg:col-span-6 order-2 lg:order-1 space-y-8 lg:space-y-10 animate-fade-up">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-charcoal-100 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-semibold text-charcoal-700">
                Spring / Summer 2026
              </span>
            </div>

            {/* Editorial Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-charcoal-950 leading-[0.95] tracking-tight">
              Dress with
              <br />
              <span className="font-serif italic font-normal text-emerald-800 tracking-tight mr-2 relative inline-block">
                intention.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-charcoal-500 max-w-md leading-relaxed font-light">
              Thoughtfully crafted clothing for the modern wardrobe. Minimalist
              designs, premium materials, and enduring style.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-emerald-950 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-full transition-all shadow-xs"
              >
                Shop Now
              </Link>
              <Link
                href="/about"
                className="btn-secondary text-sm px-9 py-4 font-semibold"
              >
                Our Story
              </Link>
            </div>

            {/* Premium Stats Widget */}
            <div className="pt-8 border-t border-charcoal-100/80 max-w-md">
              <div className="flex gap-8 px-6 py-5 rounded-2xl bg-white/30 backdrop-blur-md border border-white/50 shadow-soft transition-all duration-500 hover:shadow-soft-md hover:border-white/80 hover:bg-white/40">
                {statItems.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex-1 text-center sm:text-left"
                  >
                    <p className="text-2.5xl font-bold text-charcoal-900 tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-charcoal-400 mt-1 font-medium tracking-[0.1em] uppercase">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid visual side */}
          <div className="lg:col-span-6 order-1 lg:order-2 grid grid-cols-2 gap-4 h-[480px] sm:h-[550px] lg:h-[620px] w-full animate-fade-in">
            {/* Tall Image - Saree */}
            <div className="relative rounded-[2.5rem] overflow-hidden mt-8 shadow-soft-lg border-4 border-white animate-float">
              <Image
                src="https://zaribanaras.com/cdn/shop/products/BF-183E.jpg?v=1756359508"
                alt="Woman wearing elegant luxury Saree"
                fill
                className="object-cover object-top transition-transform duration-1000 ease-premium hover:scale-105"
                priority
                sizes="(max-width: 1024px) 40vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Split Images */}
            <div className="space-y-4 h-full flex flex-col justify-between">
              {/* Top Split Image - Panjabi */}
              <div
                className="relative rounded-[2rem] overflow-hidden h-[48%] shadow-soft-lg border-4 border-white animate-float"
                style={{ animationDelay: "1.5s", animationDuration: "7s" }}
              >
                <Image
                  src="https://www.yellowclothing.net/cdn/shop/files/DSC09746_bda242ed-87fc-4756-9bd1-53ef63dbaead.jpg?v=1784004255"
                  alt="Man wearing traditional Panjabi"
                  fill
                  className="object-cover object-top transition-transform duration-1000 ease-premium hover:scale-105"
                  sizes="(max-width: 1024px) 40vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
              {/* Bottom Split Image - Kids */}
              <div
                className="relative rounded-[2rem] overflow-hidden h-[48%] shadow-soft-lg border-4 border-white animate-float"
                style={{ animationDelay: "3s", animationDuration: "5s" }}
              >
                <Image
                  src="https://i.pinimg.com/originals/61/ae/35/61ae35b0305e8e20a3d4127530049bb4.jpg"
                  alt="Kids traditional and luxury wear"
                  fill
                  className="object-cover object-top transition-transform duration-1000 ease-premium hover:scale-105"
                  sizes="(max-width: 1024px) 40vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
