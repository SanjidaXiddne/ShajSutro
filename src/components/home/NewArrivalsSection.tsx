"use client";

import ProductGrid from "@/components/product/ProductGrid";
import { products as fallbackProducts } from "@/data/products";
import { getApiBase } from "@/lib/apiBase";
import { Product } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  stock?: number;
  totalOrdered?: number;
  tags?: string[];
}

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

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiBase()}/api/products?badge=New&limit=4`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data && j.data.length > 0) {
          setProducts((j.data as ApiProduct[]).map(mapProduct));
        } else {
          return fetch(`${getApiBase()}/api/products?limit=4`)
            .then((r) => r.json())
            .then((fj) => {
              if (fj.success && fj.data && fj.data.length > 0) {
                setProducts((fj.data as ApiProduct[]).map(mapProduct));
              } else {
                setProducts(fallbackProducts.slice(0, 4));
              }
            })
            .catch(() => {
              setProducts(fallbackProducts.slice(0, 4));
            });
        }
      })
      .catch(() => {
        setProducts(fallbackProducts.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-6 right-6 sm:left-12 sm:right-12 h-px bg-gradient-to-r from-transparent via-charcoal-100 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase block mb-1.5">Just In</span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-charcoal-950 tracking-tight">New Arrivals</h2>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1 font-light">
              Fresh styles carefully added to the collection
            </p>
          </div>
          <Link
            href="/shop?badge=New"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-charcoal-700 hover:text-emerald-950 transition-colors group"
          >
            <span>View all</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 sm:gap-x-7">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] rounded-2xl bg-charcoal-50 border border-charcoal-100/50 animate-pulse" />
                <div className="h-4 bg-charcoal-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-charcoal-100 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={products} columns={4} />
        )}

        <div className="mt-14 text-center sm:hidden">
          <Link
            href="/shop?badge=New"
            className="btn-secondary w-full sm:w-auto font-semibold px-8 py-3.5"
          >
            View All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}
