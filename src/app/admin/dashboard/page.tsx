"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import DataTable from "@/components/admin/DataTable";
import StatCard from "@/components/admin/StatCard";
import { useAdminAuth } from "@/context/AdminAuthContext";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

const RevenueChart = dynamic(() => import("@/components/admin/RevenueChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin" />
    </div>
  ),
});

const OrderStatusChart = dynamic(
  () => import("@/components/admin/OrderStatusChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin" />
      </div>
    ),
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopProduct {
  _id: string;
  name: string;
  image?: string;
  price?: number;
  totalSold: number;
  totalRevenue: number;
}

interface LowStockProduct {
  _id: string;
  name: string;
  images?: string[];
  price: number;
  stock: number;
}

interface GrowthMetrics {
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  monthlyGrowth: number;
  thisWeekRevenue: number;
  lastWeekRevenue: number;
  weeklyGrowth: number;
}

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: { _id: string; count: number }[];
  recentOrders: RecentOrder[];
  revenueByDay: { date: string; revenue: number }[];
  topSellingProducts?: TopProduct[];
  lowStockProducts?: LowStockProduct[];
  growthMetrics?: GrowthMetrics;
}

interface RecentOrder {
  _id: string;
  user: { name: string; email: string } | null;
  total: number;
  status: string;
  createdAt: string;
  items: unknown[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> =
  {
    pending: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "bg-amber-400" },
    confirmed: {
      bg: "rgba(167,139,250,0.12)",
      text: "#a78bfa",
      dot: "bg-violet-400",
    },
    shipped: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", dot: "bg-blue-400" },
    delivered: {
      bg: "rgba(52,211,153,0.12)",
      text: "#34d399",
      dot: "bg-emerald-400",
    },
    cancelled: { bg: "rgba(248,113,113,0.12)", text: "#f87171", dot: "bg-red-400" },
    returned: {
      bg: "rgba(251,146,60,0.12)",
      text: "#fb923c",
      dot: "bg-orange-400",
    },
  };

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function DashboardContent() {
  const { apiFetch } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ data: DashboardStats }>("/admin/stats")
      .then((res) => setStats(res.data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  const orderColumns = [
    {
      key: "_id",
      label: "Order",
      render: (row: RecentOrder) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
          #{row._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "user",
      label: "Customer",
      render: (row: RecentOrder) =>
        row.user ? (
          <div>
            <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
              {row.user.name}
            </p>
            <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>{row.user.email}</p>
          </div>
        ) : (
          <span className="text-xs italic" style={{ color: "rgba(148,163,184,0.4)" }}>Deleted user</span>
        ),
    },
    {
      key: "items",
      label: "Items",
      render: (row: RecentOrder) => (
        <span className="text-sm font-medium" style={{ color: "rgba(226,232,240,0.7)" }}>
          {row.items.length} item{row.items.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (row: RecentOrder) => (
        <span className="font-black" style={{ color: "#f1f5f9" }}>৳{fmt(row.total)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: RecentOrder) => {
        const s = STATUS_BADGE[row.status];
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize"
            style={s ? { background: s.bg, color: s.text } : { background: "rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.7)" }}
          >
            {s && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
            {row.status}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row: RecentOrder) => (
        <span className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.5)" }}>
          {new Date(row.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="font-semibold text-sm" style={{ color: "#e2e8f0" }}>{error}</p>
          <button
            onClick={() => location.reload()}
            className="mt-3 text-sm font-semibold hover:underline"
            style={{ color: "#a78bfa" }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const growth = stats?.growthMetrics;
  const topProducts = stats?.topSellingProducts ?? [];
  const lowStock = stats?.lowStockProducts ?? [];

  return (
    <div className="p-4 sm:p-8 space-y-7">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`৳${fmt(stats?.totalRevenue ?? 0)}`}
          accent="emerald"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Orders"
          value={fmt(stats?.totalOrders ?? 0)}
          accent="violet"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Products"
          value={fmt(stats?.totalProducts ?? 0)}
          accent="amber"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Users"
          value={fmt(stats?.totalUsers ?? 0)}
          accent="blue"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          }
        />
      </div>

      {/* FEATURE 3: Monthly & Weekly Growth Metrics */}
      {growth && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly Growth Widget */}
          <div className="rounded-2xl border p-5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400">📅 Monthly Sales Growth</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-slate-100">৳{fmt(growth.thisMonthRevenue)}</span>
                <span className="text-xs text-slate-400">this month</span>
              </div>
              <p className="text-xs text-slate-500">vs ৳{fmt(growth.lastMonthRevenue)} last month</p>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border ${
              growth.monthlyGrowth >= 0
                ? "bg-emerald-900/30 text-emerald-400 border-emerald-500/30"
                : "bg-rose-900/30 text-rose-400 border-rose-500/30"
            }`}>
              <span>{growth.monthlyGrowth >= 0 ? "▲" : "▼"}</span>
              <span>{growth.monthlyGrowth >= 0 ? `+${growth.monthlyGrowth}%` : `${growth.monthlyGrowth}%`}</span>
            </div>
          </div>

          {/* Weekly Growth Widget */}
          <div className="rounded-2xl border p-5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400">⚡ Weekly Sales Growth</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-slate-100">৳{fmt(growth.thisWeekRevenue)}</span>
                <span className="text-xs text-slate-400">this week (7d)</span>
              </div>
              <p className="text-xs text-slate-500">vs ৳{fmt(growth.lastWeekRevenue)} previous week</p>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border ${
              growth.weeklyGrowth >= 0
                ? "bg-emerald-900/30 text-emerald-400 border-emerald-500/30"
                : "bg-rose-900/30 text-rose-400 border-rose-500/30"
            }`}>
              <span>{growth.weeklyGrowth >= 0 ? "▲" : "▼"}</span>
              <span>{growth.weeklyGrowth >= 0 ? `+${growth.weeklyGrowth}%` : `${growth.weeklyGrowth}%`}</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border p-6" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold" style={{ color: "#e2e8f0" }}>
                Revenue Over Time
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>
                Daily revenue trend
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
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
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                />
              </svg>
            </div>
          </div>
          <RevenueChart data={stats?.revenueByDay ?? []} />
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold" style={{ color: "#e2e8f0" }}>
                Orders by Status
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>
                Current distribution
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
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
                  d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
                />
              </svg>
            </div>
          </div>
          <OrderStatusChart data={stats?.ordersByStatus ?? []} />
        </div>
      </div>

      {/* FEATURE 1 & 2: Top Selling Products & Low Stock Alert Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Selling Products */}
        <div className="rounded-2xl border p-6 space-y-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center justify-between pb-3 border-b border-white/6">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>🔥</span> Top Selling Products
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Most popular items by sales volume</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-900/20 border border-amber-500/20 px-2.5 py-1 rounded-full">
              Top 5
            </span>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No sales data available yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={p._id || idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                      idx === 0 ? "bg-amber-500 text-slate-950" :
                      idx === 1 ? "bg-slate-300 text-slate-950" :
                      idx === 2 ? "bg-amber-700 text-white" :
                      "bg-white/10 text-slate-400"
                    }`}>
                      #{idx + 1}
                    </span>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-xs">🛍️</div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400 font-medium">৳{fmt(p.totalRevenue)} total revenue</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-violet-900/30 text-violet-300 border border-violet-500/30 shrink-0">
                    {p.totalSold} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock / Out of Stock Alert */}
        <div className="rounded-2xl border p-6 space-y-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center justify-between pb-3 border-b border-white/6">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>⚠️</span> Low Stock Alert
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Products needing immediate restock</p>
            </div>
            <Link href="/admin/products" className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
              Manage Products →
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              <span className="text-xl block mb-1">✅</span>
              All products are well stocked!
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock.map((p) => {
                const img = p.images?.[0];
                const isOut = p.stock === 0;

                return (
                  <div key={p._id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-xs">📦</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400 font-medium">৳{fmt(p.price)}</span>
                          <span className="text-slate-600 text-xs">•</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${
                            isOut
                              ? "bg-rose-900/30 text-rose-400 border-rose-500/30"
                              : "bg-amber-900/30 text-amber-400 border-amber-500/30"
                          }`}>
                            {isOut ? "Out of Stock" : `${p.stock} left`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/admin/products"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors shrink-0"
                    >
                      Restock
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#e2e8f0" }}>Recent Orders</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>
              Latest customer activity
            </p>
          </div>
        </div>
        <DataTable<RecentOrder>
          columns={orderColumns}
          data={stats?.recentOrders ?? []}
          emptyMessage="No recent orders."
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminAuthGuard>
      <DashboardContent />
    </AdminAuthGuard>
  );
}
