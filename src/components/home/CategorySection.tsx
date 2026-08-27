"use client";

import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { getApiBase } from "@/lib/apiBase";
import { notifyInfo, notifySuccess } from "@/lib/notify";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: { _id: string; name: string; slug: string } | string;
  images: string[];
  sizes: string[];
  colors: string[];
  badge?: "New" | "Sale" | "Best Seller";
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isFeatured?: boolean;
  stock?: number;
  totalOrdered?: number;
  tags?: string[];
}

function mapProduct(p: ApiProduct): Product {
  const catName =
    typeof p.category === "object" ? p.category.name : String(p.category);
  return {
    id: p._id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    category: catName,
    images: p.images && p.images.length > 0 ? p.images : ["/placeholder.png"],
    sizes: p.sizes || [],
    colors: p.colors || [],
    badge: p.badge,
    description: p.description,
    rating: p.rating || 5,
    reviews: p.reviews || 0,
    inStock: p.inStock,
    stock: p.stock,
    totalOrdered: p.totalOrdered,
    tags: p.tags,
  };
}

export default function CategorySection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(4);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // ── Responsive cards per view ──
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else if (window.innerWidth < 1280) {
        setCardsPerView(3);
      } else {
        setCardsPerView(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Fetch Premium Gallery Products ──
  useEffect(() => {
    setLoading(true);
    // Fetch products marked with isFeatured=true
    fetch(`${getApiBase()}/api/products?isFeatured=true&limit=24`)
      .then((r) => r.json())
      .then(async (json) => {
        if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          setProducts(json.data.map(mapProduct));
        } else {
          // Graceful fallback: fetch newest products if none are marked yet
          const fallback = await fetch(`${getApiBase()}/api/products?limit=12`).then((r) => r.json());
          if (fallback?.success && Array.isArray(fallback?.data)) {
            setProducts(fallback.data.map(mapProduct));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxIndex = Math.max(0, products.length - cardsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // ── Autoplay ticker ──
  useEffect(() => {
    if (products.length <= cardsPerView || isPaused) return;
    const interval = setInterval(nextSlide, 4200);
    return () => clearInterval(interval);
  }, [products.length, cardsPerView, isPaused, nextSlide]);

  // ── Touch swipe support ──
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    touchStartX.current = null;
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(product.id);
    addItem(product, product.sizes[0] ?? "", product.colors[0] ?? "");
    notifySuccess(`Added "${product.name}" to cart`);
    setTimeout(() => setAddingId(null), 900);
  };

  if (loading) {
    return (
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-warm-50/40 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div className="space-y-3">
              <div className="w-32 h-4 bg-charcoal-100/70 rounded-full animate-pulse" />
              <div className="w-64 h-8 bg-charcoal-100 rounded-2xl animate-pulse" />
            </div>
            <div className="w-24 h-10 bg-charcoal-100/60 rounded-full animate-pulse hidden sm:block" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl aspect-[3/4] bg-charcoal-50/80 border border-charcoal-100/60 animate-pulse p-4 flex flex-col justify-end space-y-3"
              >
                <div className="w-2/3 h-4 bg-charcoal-200/50 rounded-full" />
                <div className="w-1/3 h-4 bg-charcoal-200/50 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-[#fcfbf9] to-white relative overflow-hidden select-none border-y border-charcoal-100/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background luxury ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-200/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-200/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* ─── Header & Slider Controls ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2.5 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Premium Product Gallery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-charcoal-950">
              Curated Atelier Showcase
            </h2>
            <p className="text-sm sm:text-base text-charcoal-500 font-normal max-w-xl mt-2">
              Explore handpicked masterworks and luxury signature pieces selected directly for the gallery.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 self-start md:self-end">
            {/* Slide Index Badge */}
            <div className="px-3.5 py-1.5 rounded-full bg-charcoal-50 border border-charcoal-100/80 text-xs font-mono font-bold text-charcoal-700">
              <span>0{currentIndex + 1}</span>
              <span className="text-charcoal-300 mx-1">/</span>
              <span>0{maxIndex + 1}</span>
            </div>

            {/* Left Button */}
            <button
              onClick={prevSlide}
              aria-label="Previous Product"
              className="w-11 h-11 rounded-full border border-charcoal-200 bg-white/90 backdrop-blur-sm text-charcoal-800 flex items-center justify-center hover:bg-charcoal-950 hover:text-white hover:border-charcoal-950 transition-all duration-300 shadow-soft active:scale-95 group"
            >
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Button */}
            <button
              onClick={nextSlide}
              aria-label="Next Product"
              className="w-11 h-11 rounded-full border border-charcoal-200 bg-white/90 backdrop-blur-sm text-charcoal-800 flex items-center justify-center hover:bg-charcoal-950 hover:text-white hover:border-charcoal-950 transition-all duration-300 shadow-soft active:scale-95 group"
            >
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ─── Carousel Track ─── */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="overflow-hidden relative py-2"
        >
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              transform: `translateX(-${(currentIndex * 100) / cardsPerView}%)`,
            }}
          >
            {products.map((product) => {
              const favored = isFavorite(product.id);
              const discount =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100,
                    )
                  : null;

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-2.5 sm:px-3"
                  style={{ width: `${100 / cardsPerView}%` }}
                >
                  <div className="group relative flex flex-col h-full bg-white rounded-3xl border border-charcoal-100/80 shadow-soft hover:shadow-2xl hover:border-amber-400/40 transition-all duration-500 overflow-hidden">
                    {/* Image Area */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-warm-50">
                      <Link href={`/product/${product.id}`} className="block w-full h-full">
                        <Image
                          src={product.images[0] || "/placeholder.png"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        {product.images[1] && (
                          <Image
                            src={product.images[1]}
                            alt={`${product.name} alternate view`}
                            fill
                            className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        )}
                      </Link>

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start pointer-events-none z-10">
                        {discount && discount > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                            -{discount}%
                          </span>
                        ) : product.badge ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-charcoal-900 text-white shadow-xs">
                            {product.badge}
                          </span>
                        ) : null}
                      </div>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const next = toggleFavorite(product.id);
                          if (next) notifySuccess("Added to favorites");
                          else notifyInfo("Removed from favorites");
                        }}
                        className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-soft transition-all duration-300 z-10 ${
                          favored
                            ? "text-rose-600 scale-100"
                            : "text-charcoal-400 hover:text-rose-600 hover:scale-110 opacity-90 sm:opacity-0 group-hover:opacity-100"
                        }`}
                        aria-label={favored ? "Remove favorite" : "Add favorite"}
                      >
                        <svg
                          className="w-4 h-4"
                          fill={favored ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.7}
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                      </button>

                      {/* Quick Add To Cart Overlay Pill */}
                      <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(e, product)}
                          disabled={!product.inStock || addingId === product.id}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${
                            addingId === product.id
                              ? "bg-emerald-600 text-white shadow-emerald-900/30"
                              : product.inStock
                              ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-950/25 border border-emerald-600/40 backdrop-blur-md active:scale-95 hover:shadow-lg"
                              : "bg-charcoal-300 text-charcoal-600 cursor-not-allowed"
                          }`}
                        >
                          {addingId === product.id ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                                <path d="M4 12a8 8 0 018-8" strokeWidth="4" className="opacity-75" />
                              </svg>
                              <span>Added</span>
                            </>
                          ) : product.inStock ? (
                            <>
                              <svg className="w-3.5 h-3.5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              <span>Quick Add</span>
                            </>
                          ) : (
                            <span>Sold Out</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-2">
                      <div>
                        {/* Category & Rating */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest truncate">
                            {product.category || "Collection"}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-charcoal-700 flex-shrink-0">
                            <span className="text-amber-400 text-xs">★</span>
                            <span>{product.rating > 0 ? product.rating.toFixed(1) : "5.0"}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <Link href={`/product/${product.id}`} className="block">
                          <h3 className="text-sm font-semibold text-charcoal-900 group-hover:text-amber-800 transition-colors line-clamp-1 leading-snug">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      {/* Price Section */}
                      <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base sm:text-lg font-bold text-charcoal-950">
                            ৳{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-charcoal-400 line-through">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/product/${product.id}`}
                          className="text-xs font-bold text-charcoal-400 group-hover:text-charcoal-950 transition-colors flex items-center gap-0.5"
                        >
                          <span>View</span>
                          <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Pagination Dots & Bottom Action ─── */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-charcoal-100/70">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-8 bg-charcoal-950"
                    : "w-2 bg-charcoal-200 hover:bg-charcoal-400"
                }`}
              />
            ))}
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-charcoal-800 hover:text-charcoal-950 group transition-colors"
          >
            <span>Explore all gallery products</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
