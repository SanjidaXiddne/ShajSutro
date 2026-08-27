"use client";

import { getApiBase } from "@/lib/apiBase";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  sku?: string;
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
    sku: p.sku,
    tags: p.tags,
  };
}

const TRENDING_TAGS = [
  { label: "Panjabi", icon: "✨" },
  { label: "Jamdani Saree", icon: "👑" },
  { label: "Banarasi Silk", icon: "💎" },
  { label: "Sherwani", icon: "🎩" },
  { label: "Kids Wear", icon: "🧒" },
  { label: "Festive Collection", icon: "🎉" },
  { label: "Pure Cotton", icon: "🌿" },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load popular/featured products for initial luxurious preview
  useEffect(() => {
    fetch(`${getApiBase()}/api/products?isFeatured=true&limit=4`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          setPopularProducts(json.data.map(mapProduct));
        } else {
          // Fallback to latest products
          fetch(`${getApiBase()}/api/products?limit=4`)
            .then((r2) => r2.json())
            .then((j2) => {
              if (j2?.success && Array.isArray(j2?.data)) {
                setPopularProducts(j2.data.map(mapProduct));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 70);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard shortcut listener (Escape & Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`${getApiBase()}/api/products?search=${encodeURIComponent(query.trim())}&limit=8`)
        .then((r) => r.json())
        .then((json) => {
          if (json?.success && Array.isArray(json?.data)) {
            setResults(json.data.map(mapProduct));
          } else {
            setResults([]);
          }
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectTrending = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 sm:pt-20 px-4 pb-8 overflow-y-auto animate-in fade-in duration-200">
      {/* Luxurious Dark Ambient Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-charcoal-950/75 backdrop-blur-xl transition-all duration-300"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-charcoal-150/80 overflow-hidden z-10 animate-in zoom-in-95 duration-250 ring-1 ring-black/5">
        
        {/* Search Header Input */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center px-6 py-5 border-b border-charcoal-100 bg-white/80"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-warm-100/70 text-charcoal-800 mr-3.5 flex-shrink-0">
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search luxury silks, panjabis, SKU or tags..."
            className="w-full bg-transparent text-charcoal-950 placeholder-charcoal-400 text-base sm:text-lg font-medium focus:outline-none tracking-tight"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="w-7 h-7 rounded-full bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200 hover:text-charcoal-950 flex items-center justify-center text-xs mr-2 transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-[11px] font-bold text-charcoal-400 hover:text-charcoal-900 rounded-lg hover:bg-charcoal-100/80 transition-colors uppercase tracking-wider font-mono hidden sm:block"
          >
            ESC
          </button>
        </form>

        {/* Modal Body */}
        <div className="p-6 max-h-[62vh] overflow-y-auto space-y-6">
          
          {/* Default State: Trending Searches & Popular Picks */}
          {!query.trim() && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Trending Pill Tags */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-charcoal-400">
                    Trending Searches
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TAGS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectTrending(item.label)}
                      className="group flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-charcoal-700 bg-charcoal-50 hover:bg-charcoal-950 hover:text-white border border-charcoal-200/60 hover:border-charcoal-950 transition-all duration-200 shadow-2xs hover:scale-102 active:scale-98"
                    >
                      <span className="text-xs opacity-70 group-hover:opacity-100">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Right Now Preview Grid */}
              {popularProducts.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-charcoal-400">
                      Popular Right Now
                    </p>
                    <Link
                      href="/shop"
                      onClick={onClose}
                      className="text-xs font-bold text-charcoal-600 hover:text-charcoal-950 transition-colors"
                    >
                      Browse All &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {popularProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-warm-50/40 hover:bg-white border border-charcoal-150/70 hover:border-charcoal-300 hover:shadow-soft transition-all duration-300 group"
                      >
                        <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-charcoal-100 flex-shrink-0">
                          <Image
                            src={p.images[0] || "/placeholder.png"}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">
                            {p.category}
                          </p>
                          <h4 className="text-xs font-semibold text-charcoal-900 group-hover:text-charcoal-950 truncate mt-0.5">
                            {p.name}
                          </h4>
                          <p className="text-xs font-bold text-charcoal-950 mt-1">
                            ৳{p.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white text-charcoal-400 group-hover:text-charcoal-950 group-hover:bg-warm-100 flex items-center justify-center text-xs transition-colors flex-shrink-0">
                          &rarr;
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-charcoal-200 border-t-charcoal-950 rounded-full animate-spin" />
              <p className="text-xs font-medium text-charcoal-500">Searching luxury collection...</p>
            </div>
          )}

          {/* Live Search Results */}
          {!loading && query.trim() && results.length > 0 && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-charcoal-100">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-charcoal-400">
                  {results.length} Products Found
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-xs font-bold text-charcoal-900 hover:text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>View All in Shop</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {results.map((product) => {
                const discount =
                  product.originalPrice && product.originalPrice > product.price
                    ? Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100,
                      )
                    : null;

                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-warm-50/90 border border-transparent hover:border-charcoal-150 transition-all duration-200 group"
                  >
                    <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-charcoal-100 flex-shrink-0 border border-charcoal-200/50">
                      <Image
                        src={product.images[0] || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="56px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          {product.category}
                        </span>
                        {product.sku && (
                          <span className="text-[10px] font-mono font-bold text-charcoal-600 bg-charcoal-100/90 px-1.5 py-0.5 rounded">
                            {product.sku}
                          </span>
                        )}
                        {discount && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-charcoal-900 group-hover:text-charcoal-950 transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs font-bold text-charcoal-950 mt-0.5">
                        ৳{product.price.toLocaleString()}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-charcoal-400 line-through ml-1.5 font-normal">
                            ৳{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-charcoal-50 group-hover:bg-charcoal-950 group-hover:text-white flex items-center justify-center text-charcoal-400 transition-all flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* No Results Empty State */}
          {!loading && query.trim() && results.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-warm-100 text-charcoal-600 flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <p className="text-sm font-bold text-charcoal-900">
                No luxury pieces found for &ldquo;{query}&rdquo;
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-2 px-5 py-2.5 bg-charcoal-950 text-white rounded-full text-xs font-semibold hover:bg-charcoal-800 transition-colors"
              >
                Search all in Catalog &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {query.trim() && results.length > 0 && (
          <div className="px-6 py-3.5 bg-warm-50/60 border-t border-charcoal-100 flex items-center justify-between">
            <span className="text-xs text-charcoal-500 font-medium">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-charcoal-200 text-[10px] font-mono font-bold text-charcoal-700">Enter ↵</kbd> to view all
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-bold text-charcoal-900 hover:text-emerald-900"
            >
              See all results &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
