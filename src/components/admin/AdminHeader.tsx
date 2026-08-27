"use client";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { getApiBase } from "@/lib/apiBase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const API = getApiBase();

const PAGE_META: Record<string, { title: string; desc: string }> = {
  "/admin/dashboard": {
    title: "Dashboard",
    desc: "Welcome back — here's your store at a glance.",
  },
  "/admin/users": {
    title: "Users",
    desc: "Manage and monitor customer accounts.",
  },
  "/admin/products": {
    title: "Products",
    desc: "Manage your store catalog and inventory.",
  },
  "/admin/orders": {
    title: "Orders",
    desc: "Track and fulfill customer orders.",
  },
  "/admin/profile": {
    title: "Profile Settings",
    desc: "Manage your administrator account information and security.",
  },
  "/admin/notifications": {
    title: "Notifications & Popups",
    desc: "Manage discount offers & store popup alerts.",
  },
  "/admin/promo-codes": {
    title: "Promo Codes",
    desc: "Manage checkout promotional codes.",
  },
  "/admin/messages": {
    title: "Customer Messages",
    desc: "View and respond to inquiries.",
  },
  "/admin/jobs": {
    title: "Job Openings",
    desc: "Manage career listings & positions.",
  },
  "/admin/applications": {
    title: "Job Applications",
    desc: "Review candidate CVs & job applications.",
  },
  "/admin/categories": {
    title: "Categories",
    desc: "Manage product categories & sub-categories.",
  },
};

interface ActivityAlert {
  id: string;
  type: "order" | "user" | "message" | "application";
  title: string;
  message: string;
  link: string;
  createdAt: string;
  badge: {
    icon: string;
    bg: string;
    text: string;
  };
}

function formatTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (isNaN(seconds) || seconds < 30) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function HeaderAvatar({ name }: { name: string }) {
  const [grad, setGrad] = useState("from-violet-600 to-indigo-600");
  const [type, setType] = useState("gradient");
  const [img, setImg] = useState("");

  useEffect(() => {
    const load = () => {
      const savedType = localStorage.getItem("admin_avatar_type");
      const savedGrad = localStorage.getItem("admin_avatar_gradient");
      const savedImg = localStorage.getItem("admin_avatar_image");
      if (savedType) setType(savedType);
      if (savedGrad) setGrad(savedGrad);
      if (savedImg) setImg(savedImg);
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  if (type === "image" && img) {
    return (
      <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-800 shadow-sm ring-1 ring-violet-500/40 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="Admin" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-[11px] font-bold shadow-sm shadow-violet-900/50 shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, token, toggleMobileSidebar } = useAdminAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [alerts, setAlerts] = useState<ActivityAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const meta = PAGE_META[pathname] ?? { title: "Admin Panel", desc: "Manage store operations" };

  const fetchAlerts = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/activity-alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAlerts(data.data);
        setUnreadCount(data.meta?.unreadCount ?? 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAlertClick = (link: string) => {
    setOpenDropdown(false);
    router.push(link);
  };

  return (
    <header
      className="h-16 sm:h-[68px] flex items-center justify-between px-4 sm:px-8 flex-shrink-0 sticky top-0 z-30"
      style={{
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Page title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          aria-label="Toggle Admin Sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight leading-none text-slate-100">
            {meta.title}
          </h1>
          {meta.desc && (
            <p className="text-xs mt-1 hidden lg:block text-slate-400">
              {meta.desc}
            </p>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">

        {/* Notification Bell & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              setOpenDropdown(!openDropdown);
              if (!openDropdown) fetchAlerts();
            }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 focus:outline-none"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(226, 232, 240, 0.8)",
            }}
            title={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications & Activity Alerts"}
            aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications & Activity Alerts"}
          >
            <svg
              className="w-[19px] h-[19px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>

            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shadow-md ring-2 ring-[#0a0a0f] animate-pulse"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Activity Dropdown Menu */}
          {openDropdown && (
            <div
              className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                background: "rgba(15, 15, 25, 0.98)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Dropdown Header */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ background: "rgba(124, 58, 237, 0.1)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight flex items-center gap-2" style={{ color: "#f1f5f9" }}>
                    <span>🔔 System Activity</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full">
                        {unreadCount} Recent
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(148, 163, 184, 0.6)" }}>
                    Live updates for orders, users &amp; messages
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAlerts}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(226,232,240,0.7)" }}
                  title="Refresh activity"
                >
                  <svg
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115.357-2m1.643 9a9 9 0 01-15.357 2"
                    />
                  </svg>
                </button>
              </div>

              {/* Activity Items List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
                {alerts.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl" style={{ background: "rgba(255,255,255,0.05)", color: "#a78bfa" }}>
                      ⚡
                    </div>
                    <p className="text-xs font-bold" style={{ color: "#e2e8f0" }}>
                      No activity alerts yet
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "rgba(148, 163, 184, 0.5)" }}>
                      New orders, users &amp; messages will appear here
                    </p>
                  </div>
                ) : (
                  alerts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleAlertClick(item.link)}
                      className="p-4 transition-colors cursor-pointer flex items-start gap-3 group"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: "rgba(255,255,255,0.06)" }}>
                        {item.badge.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span
                            className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase"
                            style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}
                          >
                            {item.badge.text}
                          </span>
                          <span className="text-[10px] font-semibold" style={{ color: "rgba(148, 163, 184, 0.5)" }}>
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold line-clamp-1 group-hover:text-violet-400 transition-colors" style={{ color: "#e2e8f0" }}>
                          {item.title}
                        </h4>

                        <p className="text-[11px] line-clamp-2 mt-0.5 leading-snug" style={{ color: "rgba(148, 163, 184, 0.6)" }}>
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Dropdown Footer Links */}
              <div className="p-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold" style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <Link
                  href="/admin/orders"
                  onClick={() => setOpenDropdown(false)}
                  className="py-1.5 px-2 rounded-xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(226,232,240,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  🛍️ Orders
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setOpenDropdown(false)}
                  className="py-1.5 px-2 rounded-xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(226,232,240,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  👤 Users
                </Link>
                <Link
                  href="/admin/messages"
                  onClick={() => setOpenDropdown(false)}
                  className="py-1.5 px-2 rounded-xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(226,232,240,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  💬 Messages
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.1)" }} />

        {/* User */}
        {admin && (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-[12px] font-semibold leading-none" style={{ color: "#f1f5f9" }}>
                {admin.name}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(148, 163, 184, 0.5)" }}>Administrator</p>
            </div>
            <HeaderAvatar name={admin.name} />
          </div>
        )}
      </div>
    </header>
  );
}
