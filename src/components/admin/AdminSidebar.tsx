"use client";

import { useAdminAuth } from "@/context/AdminAuthContext";
import Logo from "@/components/layout/Logo";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/15 border-indigo-500/20",
    activeBg:
      "bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-indigo-400 to-violet-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
  },
  {
    key: "users",
    label: "Users",
    href: "/admin/users",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15 border-cyan-500/20",
    activeBg:
      "bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
  },
  {
    key: "products",
    label: "Products",
    href: "/admin/products",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15 border-emerald-500/20",
    activeBg:
      "bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
        />
      </svg>
    ),
  },
  {
    key: "promoCodes",
    label: "Promo Codes",
    href: "/admin/promo-codes",
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/15 border-rose-500/20",
    activeBg:
      "bg-gradient-to-r from-rose-500/20 via-pink-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-rose-400 to-pink-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
  {
    key: "orders",
    label: "Orders",
    href: "/admin/orders",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15 border-amber-500/20",
    activeBg:
      "bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-amber-400 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
        />
      </svg>
    ),
  },
  {
    key: "messages",
    label: "Messages",
    href: "/admin/messages",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/15 border-purple-500/20",
    activeBg:
      "bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-purple-400 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7.5 8.25h9m-9 3h6m-8.25 8.25h13.5A2.25 2.25 0 0021 17.25V6.75a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6.75v10.5a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
  },
  {
    key: "categories",
    label: "Categories",
    href: "/admin/categories",
    iconColor: "text-fuchsia-400",
    iconBg: "bg-fuchsia-500/15 border-fuchsia-500/20",
    activeBg:
      "bg-gradient-to-r from-fuchsia-500/20 via-rose-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-fuchsia-400 to-rose-500 shadow-[0_0_12px_rgba(217,70,239,0.8)]",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
        />
      </svg>
    ),
  },
  {
    key: "jobs",
    label: "Jobs",
    href: "/admin/jobs",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15 border-blue-500/20",
    activeBg:
      "bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-blue-400 to-cyan-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
        />
      </svg>
    ),
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/admin/notifications",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15 border-amber-500/20",
    activeBg:
      "bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-amber-400 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
    ),
  },
  {
    key: "subscribers",
    label: "Subscribers",
    href: "/admin/subscribers",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15 border-emerald-500/20",
    activeBg:
      "bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-white font-bold",
    barGradient:
      "from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
];



export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout, isMobileSidebarOpen, closeMobileSidebar } = useAdminAuth();
  const isProductsSection =
    pathname === "/admin/products" ||
    pathname.startsWith("/admin/products/") ||
    pathname === "/admin/promo-codes" ||
    pathname.startsWith("/admin/promo-codes/");
  const isJobsSection =
    pathname === "/admin/jobs" ||
    pathname.startsWith("/admin/jobs/") ||
    pathname === "/admin/applications" ||
    pathname.startsWith("/admin/applications/");

  const isRootAdmin = !admin?.adminRole || admin.adminRole === "root_admin";
  const permissions = admin?.permissions;

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (isRootAdmin) return true;
    if (!permissions) return true;
    const key = item.key as keyof typeof permissions;
    return permissions[key] !== false;
  });

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 md:hidden transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-72 md:w-64 h-screen flex flex-col flex-shrink-0 border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ background: "#09090b" }}
      >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10 relative overflow-hidden bg-gradient-to-r from-violet-950/30 via-slate-900 to-indigo-950/30 shrink-0 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 group relative z-10"
        >
          <Logo size="sm" dark={false} />
        </Link>
        <span className="text-violet-400/90 text-[10px] font-extrabold tracking-[0.15em] uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          {isRootAdmin ? "Root" : "Admin"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 px-3.5 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-400/80">
          Menu
        </p>
        <div className="space-y-1.5">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  onClick={closeMobileSidebar}
                  aria-label={item.label}
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? item.activeBg
                      : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {/* Glowing vertical line for active route */}
                  {isActive && (
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b ${item.barGradient}`}
                    />
                  )}

                  {/* Icon with colorful background badge */}
                  <div
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? `${item.iconBg} ${item.iconColor} shadow-md shadow-black/20 ring-1 ring-white/10 scale-105`
                        : `${item.iconBg} ${item.iconColor} opacity-75 group-hover:opacity-100 group-hover:scale-105`
                    }`}
                  >
                    {item.icon}
                  </div>

                  <span
                    className={
                      isActive
                        ? "text-white font-bold"
                        : "group-hover:text-slate-200"
                    }
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Jobs sub-section */}
                {item.href === "/admin/jobs" && isJobsSection && (
                  <Link
                    href="/admin/applications"
                    onClick={closeMobileSidebar}
                    aria-label="Job Applications"
                    className={`relative flex items-center gap-2.5 pl-11 pr-3 py-2 min-h-[40px] rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      pathname === "/admin/applications" ||
                      pathname.startsWith("/admin/applications/")
                        ? "bg-teal-500/20 text-teal-300 font-bold border-l-2 border-teal-400"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-lg bg-teal-500/15 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16.5 6.75V6a2.25 2.25 0 00-2.25-2.25h-4.5A2.25 2.25 0 007.5 6v.75m9 0H7.5m9 0H19.5A2.25 2.25 0 0121.75 9v9.75A2.25 2.25 0 0119.5 21H4.5A2.25 2.25 0 012.25 18.75V9A2.25 2.25 0 014.5 6.75h3m4.5 4.5h6m-6 3h6m-6 3h4.5"
                        />
                      </svg>
                    </div>
                    Applications
                  </Link>
                )}

              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3.5 py-4 border-t border-white/10 bg-[#09090b] shrink-0 flex-shrink-0 mt-auto">
        <p className="px-3 mb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-400/80">
          Account
        </p>
        <div className="space-y-1">
          <Link
            href="/admin/profile"
            onClick={closeMobileSidebar}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
              pathname === "/admin/profile"
                ? "bg-violet-500/20 text-violet-300 border-l-2 border-violet-400"
                : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <div className="w-7 h-7 rounded-xl bg-violet-500/15 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            Profile Settings
          </Link>
          <Link
            href="/"
            target="_blank"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </div>
            View Store
          </Link>
          <button
            onClick={() => {
              closeMobileSidebar();
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </div>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
