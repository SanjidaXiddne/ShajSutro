"use client";

import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/context/CartContext";
import { getApiBase } from "@/lib/apiBase";
import { notifyInfo } from "@/lib/notify";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function CartPage() {
  const router = useRouter();
  const { state, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const [suggested, setSuggested] = useState<Product[]>([]);

  const handleCheckoutClick = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      notifyInfo("Please log in to proceed to checkout.");
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  useEffect(() => {
    fetch(`${getApiBase()}/api/products?badge=Best+Seller&limit=4`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setSuggested((j.data as ApiProduct[]).map(mapProduct));
      })
      .catch(() => {});
  }, []);

  const shipping = subtotal >= 1200 ? 0 : 9.99;
  const tax = 0;
  const total = subtotal + shipping;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center py-28">
        <div className="w-20 h-20 rounded-full bg-charcoal-50 flex items-center justify-center mb-7">
          <svg
            className="w-9 h-9 text-charcoal-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-charcoal-950 mb-3">
          Your cart is empty
        </h1>
        <p className="text-charcoal-400 mb-9 max-w-sm font-light">
          Looks like you haven&apos;t added anything to your cart yet. Explore
          our collection to find something you love.
        </p>
        <Link href="/shop" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <h1 className="text-3xl font-semibold text-charcoal-950 mb-2 tracking-tight">
          Shopping Cart
        </h1>
        <p className="text-charcoal-400 text-sm mb-12 font-light">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </p>

        <div className="grid lg:grid-cols-3 gap-14">
          <div className="lg:col-span-2">
            {subtotal < 1200 && (
              <div className="mb-7 p-5 bg-accent-50 rounded-2xl border border-accent-100">
                <div className="flex justify-between text-sm mb-2.5">
                  <span className="text-accent-700 font-medium">
                    Add <strong>৳{(1200 - subtotal).toFixed(2)}</strong> more
                    for free shipping
                  </span>
                  <span className="text-accent-500 text-xs font-light">
                    ৳{subtotal.toFixed(2)} / ৳1200
                  </span>
                </div>
                <div className="h-1.5 bg-accent-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((subtotal / 1200) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {subtotal >= 1200 && (
              <div className="mb-7 p-5 bg-green-50 rounded-2xl flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-green-700 font-medium">
                  You qualify for free shipping!
                </span>
              </div>
            )}

            <div className="divide-y divide-charcoal-100">
              {state.items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                  className="py-7 flex gap-5"
                >
                  <Link
                    href={`/product/${item.product.id}`}
                    className="relative w-24 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-warm-50 shadow-soft"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link
                          href={`/product/${item.product.id}`}
                          className="text-base font-medium text-charcoal-900 hover:text-charcoal-600 transition-colors duration-300 line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span className="text-sm text-charcoal-400 font-light">
                            Size: {item.size}
                          </span>
                          <span className="text-sm text-charcoal-400 font-light">
                            Color: {item.color}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-semibold text-charcoal-900">
                          ৳{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        {item.product.originalPrice &&
                          item.product.originalPrice > item.product.price && (
                            <p className="text-sm text-charcoal-300 line-through font-light">
                              ৳
                              {(
                                item.product.originalPrice * item.quantity
                              ).toFixed(2)}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-charcoal-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity - 1,
                            )
                          }
                          className="w-9 h-9 flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="w-9 text-center text-sm font-medium text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity + 1,
                            )
                          }
                          className="w-9 h-9 flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeItem(item.product.id, item.size, item.color)
                        }
                        className="text-sm text-charcoal-300 hover:text-red-500 transition-colors duration-300 flex items-center gap-1.5"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 pt-7 border-t border-charcoal-100">
              <Link
                href="/shop"
                className="btn-secondary text-sm inline-flex items-center gap-2 group"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          <div>
            <div className="bg-warm-50 rounded-2xl p-7 sticky top-28 border border-warm-100">
              <h2 className="text-lg font-semibold text-charcoal-950 mb-7">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-light">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-medium text-charcoal-900">
                    ৳{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-light">Shipping</span>
                  <span className="font-medium text-charcoal-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `৳${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-warm-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="input-field flex-1 text-xs py-3 !bg-white"
                  />
                  <button className="px-5 py-3 text-xs font-medium border border-charcoal-200 rounded-xl hover:bg-white transition-all duration-300 whitespace-nowrap">
                    Apply
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-warm-200 flex justify-between">
                <span className="text-base font-semibold text-charcoal-950">
                  Total
                </span>
                <span className="text-xl font-bold text-charcoal-950">
                  ৳{total.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                className="btn-primary w-full text-center mt-6 block"
              >
                Proceed to Checkout
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-charcoal-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <span className="font-light">
                  Secure SSL encrypted checkout
                </span>
              </div>
            </div>
          </div>
        </div>

        {suggested.length > 0 && (
          <div className="mt-24 pt-14 border-t border-charcoal-100">
            <span className="section-label">Recommended</span>
            <h2 className="section-title mb-10">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10 sm:gap-x-7">
              {suggested.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
