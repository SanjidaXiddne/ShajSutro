"use client";

import { getApiBase } from "@/lib/apiBase";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  images: string[];
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface PromoItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  cta: string;
}

function toPromoItem(product: ApiProduct): PromoItem {
  return {
    id: product._id,
    title: product.name,
    subtitle: product.description,
    href: `/product/${product._id}`,
    image: product.images[0] ?? "",
    cta: "Explore Piece",
  };
}

function trimText(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
}

export default function PromoGrid() {
  const [items, setItems] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiBase()}/api/products?isFeatured=true&limit=40`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) return;
        const products = json.data as ApiProduct[];

        // Filter products to secure one featured product per target category in exact priority order
        const mensProduct = products.find(
          (p) => p.category?.slug === "mens" && p.images?.length,
        );
        const womensProduct = products.find(
          (p) => p.category?.slug === "womens" && p.images?.length,
        );
        const kidsProduct = products.find(
          (p) => p.category?.slug === "kids" && p.images?.length,
        );

        const orderedItems: PromoItem[] = [];
        if (mensProduct) orderedItems.push(toPromoItem(mensProduct));
        if (womensProduct) orderedItems.push(toPromoItem(womensProduct));
        if (kidsProduct) orderedItems.push(toPromoItem(kidsProduct));

        setItems(orderedItems);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && items.length === 0) return null;

  const mainItem = items[0] ?? {
    id: "featured-1",
    title: "The Editorial Collection",
    subtitle:
      "Enduring silhouettes tailored in breathable, organically grown flax linen.",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    cta: "Explore Piece",
  };
  const sideItems =
    items.slice(1).length > 0
      ? items.slice(1)
      : [
          {
            id: "featured-2",
            title: "Premium Knits",
            subtitle: "Finely spun lightweight layers.",
            href: "/shop",
            image:
              "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
            cta: "Shop Now",
          },
          {
            id: "featured-3",
            title: "Sleek Tailoring",
            subtitle: "Structure meets everyday ease.",
            href: "/shop",
            image:
              "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
            cta: "Shop Now",
          },
        ];

  return (
    <section className="py-12 sm:py-16 bg-white relative overflow-hidden">
      {/* Accent Background Glow */}
      <div className="absolute right-0 top-1/4 w-[400px] h-[400px] bg-accent-100/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="mb-8 sm:mb-10">
          <span className="section-label">Featured Spotlight</span>
          <h2 className="section-title">Curated For You</h2>
          <p className="section-subtitle sm:mt-2">
            Handpicked essentials crafted for modern living
          </p>
        </div>

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
            <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100/50 aspect-[4/5] md:aspect-auto md:row-span-2 animate-pulse" />
            <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100/50 aspect-video animate-pulse" />
            <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100/50 aspect-video animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
            {/* Main spotlight featured piece */}
            {mainItem && (
              <Link
                href={mainItem.href}
                className="group relative overflow-hidden rounded-2xl min-h-[460px] sm:min-h-[520px] md:min-h-[640px] md:row-span-2 bg-warm-50 border border-charcoal-100/30 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col justify-end"
              >
                <Image
                  src={mainItem.image}
                  alt={mainItem.title}
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-premium group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                {/* Visual rich vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/20 to-transparent" />

                <div className="relative p-6 sm:p-8 z-10">
                  <p className="text-xs font-semibold text-accent-200 tracking-wider uppercase mb-1.5">
                    Spotlight Collection
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-serif italic text-white mb-2 tracking-tight leading-tight">
                    {mainItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-light text-white/80 mb-5 leading-relaxed max-w-sm">
                    {trimText(mainItem.subtitle, 120)}
                  </p>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-charcoal-950 text-xs font-bold rounded-full transition-all shadow-xs group-hover:bg-warm-50">
                    <span>{mainItem.cta}</span>
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            )}

            {/* Side featured pieces */}
            {sideItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl min-h-[290px] sm:min-h-[305px] bg-warm-50 border border-charcoal-100/30 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col justify-end"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-premium group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/20 to-transparent" />

                <div className="relative p-6 sm:p-8 z-10">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 tracking-tight leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs font-light text-white/80 mb-3.5 leading-relaxed max-w-xs line-clamp-2">
                    {trimText(item.subtitle, 80)}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:gap-2.5 transition-all">
                    <span>{item.cta}</span>
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
