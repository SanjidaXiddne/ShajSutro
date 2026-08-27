"use client";

import { getColorHex } from "@/lib/colors";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { notifyInfo, notifySuccess } from "@/lib/notify";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

function formatProductTitle(title: string): string {
  if (!title) return "";
  if (title === title.toUpperCase() && title.length > 3) {
    return title
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return title;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const favored = isFavorite(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    addItem(product, product.sizes[0] ?? "", product.colors[0] ?? "");
    setTimeout(() => setIsAddingToCart(false), 1000);
  };

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} className="block flex-1 no-underline group-hover:no-underline">
        <div className="relative overflow-hidden rounded-2xl bg-emerald-50/40 aspect-[3/4] shadow-soft transition-shadow duration-500 group-hover:shadow-soft-lg">
          <Image
            src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-all duration-700 ease-premium group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {(discount && discount > 0) || product.badge ? (
            <div className="absolute top-3 left-3 pointer-events-none">
              <span
                className={`px-2.5 py-1 text-xs font-semibold tracking-wide rounded-full shadow-xs ${
                  discount && discount > 0
                    ? "bg-rose-600 text-white"
                    : product.badge === "New"
                    ? "bg-emerald-950 text-white"
                    : "bg-emerald-800 text-white"
                }`}
              >
                {discount && discount > 0 ? `-${discount}%` : product.badge}
              </span>
            </div>
          ) : null}

          {/* Accessible 40x40px elevated favorite button */}
          <button
            type="button"
            className={`absolute top-3.5 right-3.5 z-10 w-10 h-10 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-md border border-black/5 transition-all duration-300 ${
              isHovered ? "opacity-100 scale-100" : "opacity-90 sm:opacity-0 sm:group-hover:opacity-100 scale-95 sm:scale-90 sm:group-hover:scale-100"
            } ${favored ? "text-rose-600" : "text-emerald-950/70 hover:text-rose-600 hover:bg-white active:scale-90"}`}
            aria-label={favored ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const next = toggleFavorite(product.id);
              if (next) notifySuccess("Added to favorites");
              else notifyInfo("Removed from favorites");
            }}
          >
            <svg
              className="w-5 h-5"
              fill={favored ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>

        <div className="mt-3 space-y-1.5">
          <h3 className="text-xs sm:text-sm font-semibold text-emerald-950 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-1">
            {formatProductTitle(product.name)}
          </h3>

          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(product.rating)
                      ? "text-amber-500"
                      : "text-emerald-950/20"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-emerald-900/70">({product.reviews})</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-emerald-950">
              ৳{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xs text-emerald-900/60 line-through">
                  ৳{product.originalPrice}
                </span>
                {discount && discount > 0 && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    {discount}% OFF
                  </span>
                )}
              </>
            )}
          </div>

          {/* Stock + Orders row */}
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <StockBadge stock={product.stock} inStock={product.inStock} />
            {product.totalOrdered !== undefined && product.totalOrdered > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-900/70 font-normal">
                <svg className="w-3 h-3 text-emerald-800/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {product.totalOrdered >= 1000
                  ? `${(product.totalOrdered / 1000).toFixed(1)}k`
                  : product.totalOrdered}+ ordered
              </span>
            )}
          </div>

          {product.colors.length > 1 && (
            <div className="flex gap-1.5 pt-0.5">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color}
                  className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs transition-transform duration-200 hover:scale-125"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-emerald-900/70 self-center">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="pt-2.5 mt-auto">
        {/* Prominent 44px Solid Primary Add to Cart CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={`w-full min-h-[44px] py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${
            isAddingToCart
              ? "bg-emerald-700 text-white"
              : "bg-emerald-950 text-white hover:bg-emerald-800 hover:shadow-md active:scale-[0.98]"
          }`}
        >
          {isAddingToCart ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Added!
            </span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function StockBadge({ stock, inStock }: { stock?: number; inStock: boolean }) {
  if (!inStock) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Out of stock
      </span>
    );
  }
  if (stock === undefined) return null;
  if (stock === 0) return null;
  if (stock <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Only {stock} left!
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {stock} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      {stock} in stock
    </span>
  );
}
