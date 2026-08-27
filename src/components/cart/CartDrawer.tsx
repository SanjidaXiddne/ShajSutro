"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { notifyInfo } from "@/lib/notify";

export default function CartDrawer() {
  const router = useRouter();
  const { state, removeItem, updateQuantity, closeCart, subtotal, totalItems } = useCart();

  const handleCheckoutClick = () => {
    closeCart();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      notifyInfo("Please log in to proceed to checkout.");
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [state.isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-charcoal-950/20 backdrop-blur-sm transition-opacity duration-400 ease-premium ${
          state.isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-soft-xl flex flex-col transition-transform duration-400 ease-premium ${
          state.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-7 py-6 border-b border-charcoal-100">
          <div>
            <h2 className="text-lg font-semibold text-charcoal-950">Your Cart</h2>
            <p className="text-sm text-charcoal-400 mt-0.5 font-light">{totalItems} {totalItems === 1 ? "item" : "items"}</p>
          </div>
          <button
            onClick={closeCart}
            className="p-2.5 text-charcoal-300 hover:text-charcoal-900 hover:bg-charcoal-50 rounded-full transition-all duration-300"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-5">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-charcoal-50 flex items-center justify-center mb-5">
                <svg className="w-9 h-9 text-charcoal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-charcoal-900 mb-1.5">Your cart is empty</h3>
              <p className="text-sm text-charcoal-400 mb-7 font-light">Discover our curated collection</p>
              <button
                onClick={closeCart}
                className="btn-primary text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-charcoal-100 -mx-7 px-7">
              {state.items.map((item, index) => (
                <li key={`${item.product.id}-${item.size}-${item.color}-${index}`} className="py-6 flex gap-4">
                  <Link
                    href={`/product/${item.product.id}`}
                    onClick={closeCart}
                    className="relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-warm-50"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.id}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-charcoal-900 hover:text-charcoal-600 transition-colors duration-300 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-charcoal-400 font-light">{item.size}</span>
                      <span className="text-charcoal-200">&middot;</span>
                      <span className="text-xs text-charcoal-400 font-light">{item.color}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-charcoal-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-7 text-center text-sm font-medium text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-charcoal-900">
                          ৳{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() =>
                            removeItem(item.product.id, item.size, item.color)
                          }
                          className="p-1 text-charcoal-300 hover:text-red-500 transition-colors duration-300"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="px-7 py-6 border-t border-charcoal-100 space-y-4">
            {/* Free shipping banner */}
            {subtotal < 1200 ? (
              <div className="flex items-center gap-2.5 bg-accent-50 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-accent-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <p className="text-xs text-accent-700">
                  Add <strong>৳{(1200 - subtotal).toFixed(2)}</strong> more for free shipping
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-green-50 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-green-700 font-medium">You qualify for free shipping!</p>
              </div>
            )}

            {/* ── Order summary ── */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-400 font-light">Subtotal</span>
                <span className="font-semibold text-charcoal-900">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-400 font-light">Shipping</span>
                <span className="text-charcoal-400 font-light">{subtotal >= 1200 ? "Free" : "Calculated at checkout"}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="btn-primary w-full text-center"
              >
                Checkout — ৳{subtotal.toFixed(2)}
              </button>
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn-secondary w-full text-center text-sm"
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
