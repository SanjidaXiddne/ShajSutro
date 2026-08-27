"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductGrid from "@/components/product/ProductGrid";
import { useFavorites } from "@/context/FavoritesContext";
import { getApiBase } from "@/lib/apiBase";
import { Product } from "@/types";

type ApiProduct = {
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
  stock?: number;
  totalOrdered?: number;
  tags?: string[];
};

function mapProduct(p: ApiProduct): Product {
  const catSlug = typeof p.category === "object" ? p.category.slug : p.category;
  return {
    id: p._id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    category: catSlug,
    images: p.images,
    sizes: p.sizes,
    colors: p.colors,
    badge: p.badge,
    description: p.description,
    rating: p.rating,
    reviews: p.reviews,
    inStock: p.inStock,
    stock: p.stock,
    totalOrdered: p.totalOrdered,
    tags: p.tags,
  };
}

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const ids = useMemo(() => Array.from(favorites), [favorites]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `${getApiBase()}/api/products?ids=${encodeURIComponent(ids.join(","))}&limit=100`,
        );
        const json = (await res.json()) as {
          success: boolean;
          data?: ApiProduct[];
        };
        if (!alive) return;
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data.map(mapProduct));
        } else {
          setProducts([]);
        }
      } catch {
        if (!alive) return;
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [ids]);

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
              Wishlist
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-charcoal-950">
              Favorites
            </h1>
            <p className="mt-3 text-sm text-charcoal-500 font-light">
              {ids.length} saved product{ids.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/shop" className="btn-primary px-6 py-3 text-sm">
            Continue shopping
          </Link>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 sm:gap-x-7">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-charcoal-100 shadow-soft h-[420px] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-charcoal-100 shadow-soft p-10 sm:p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-charcoal-50 border border-charcoal-100 mx-auto grid place-items-center text-charcoal-500">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h2 className="mt-5 text-xl font-semibold text-charcoal-950">
                No favorites yet
              </h2>
              <p className="mt-2 text-sm text-charcoal-500 font-light">
                Tap the heart icon on a product to save it here.
              </p>
              <Link href="/shop" className="btn-primary px-8 py-3.5 text-sm mt-6 inline-flex">
                Browse shop
              </Link>
            </div>
          ) : (
            <ProductGrid products={products} columns={4} />
          )}
        </div>
      </div>
    </div>
  );
}

