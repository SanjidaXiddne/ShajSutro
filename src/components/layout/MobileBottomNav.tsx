"use client";

import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { favorites } = useFavorites();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
  }, [pathname]);

  // Hide on admin routes
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-2 py-2.5 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
          pathname === "/"
            ? "text-amber-400 font-black scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={pathname === "/" ? 2.5 : 1.8}
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
        <span className="text-[10px] font-bold tracking-tight">Home</span>
      </Link>

      {/* Shop */}
      <Link
        href="/shop"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
          pathname.startsWith("/shop") || pathname.startsWith("/product")
            ? "text-amber-400 font-black scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={pathname.startsWith("/shop") ? 2.5 : 1.8}
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
          />
        </svg>
        <span className="text-[10px] font-bold tracking-tight">Shop</span>
      </Link>

      {/* Cart Drawer Trigger */}
      <button
        type="button"
        onClick={openCart}
        className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl text-slate-400 hover:text-amber-400 transition-all active:scale-95 cursor-pointer"
      >
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce shadow-md">
              {totalItems}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold tracking-tight">Cart</span>
      </button>

      {/* Wishlist / Favorites */}
      <Link
        href="/favorites"
        className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
          pathname === "/favorites"
            ? "text-amber-400 font-black scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={pathname === "/favorites" ? 2.5 : 1.8}
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          {favorites.size > 0 && (
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
              {favorites.size}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold tracking-tight">Saved</span>
      </Link>

      {/* Account / Profile */}
      <Link
        href={isLoggedIn ? "/profile" : "/login"}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
          pathname === "/profile" || pathname === "/login"
            ? "text-amber-400 font-black scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={pathname === "/profile" || pathname === "/login" ? 2.5 : 1.8}
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
        <span className="text-[10px] font-bold tracking-tight">
          {isLoggedIn ? "Account" : "Sign In"}
        </span>
      </Link>
    </div>
  );
}
