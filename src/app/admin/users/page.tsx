"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "sub-admin";
  isBlocked: boolean;
  createdAt: string;
  lastLoginAt?: string;
  passwordChangedAt?: string;
}

interface ApiResponse {
  success: boolean;
  data: User[];
  pagination: { total: number; page: number; pages: number };
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
    >
      {type === "success" ? (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      {msg}
    </div>
  );
}

// ─── Create User Modal ────────────────────────────────────────────────────────

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: User) => void;
}) {
  const { apiFetch } = useAdminAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin" | "sub-admin",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await apiFetch<{ success: boolean; data: User }>(
        "/admin/users",
        {
          method: "POST",
          body: JSON.stringify(form),
        },
      );
      onCreated(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "rgba(22,22,35,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <h3 className="text-lg font-bold text-slate-100">Create User</h3>
            <p className="text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>
              Add a new account to the platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "rgba(148,163,184,0.6)" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="px-7 py-5 space-y-4">
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(248,113,113,0.12)",
                border: "1px solid rgba(248,113,113,0.2)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              Full Name *
            </label>
            <input
              name="name"
              required
              value={form.name}
              onChange={set}
              placeholder="e.g. Jane Smith"
              className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none admin-dark-input"
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f1f5f9",
                colorScheme: "dark",
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              Email Address *
            </label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={set}
              placeholder="jane@example.com"
              className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none admin-dark-input"
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f1f5f9",
                colorScheme: "dark",
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              Password *
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                value={form.password}
                onChange={set}
                placeholder="Min 6 characters"
                className="w-full px-3.5 py-3 pr-10 rounded-xl text-sm focus:outline-none admin-dark-input"
                style={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f1f5f9",
                  colorScheme: "dark",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(148,163,184,0.6)" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {showPwd ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  ) : (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={set}
              className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none"
              style={{
                background: "rgba(15,15,25,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f1f5f9",
              }}
            >
              <option value="user">Customer</option>
              <option value="sub-admin">Sub-Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 rounded-2xl text-sm font-semibold transition-colors"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(226,232,240,0.7)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  user,
  onConfirm,
  onCancel,
  loading,
}: {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="rounded-3xl w-full max-w-sm p-8"
        style={{
          background: "rgba(15,15,25,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: "rgba(248,113,113,0.12)",
            border: "1px solid rgba(248,113,113,0.2)",
          }}
        >
          <svg
            className="w-7 h-7 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: "#e2e8f0" }}>
          Delete User
        </h3>
        <p className="text-sm mb-7" style={{ color: "rgba(148,163,184,0.6)" }}>
          You&apos;re about to permanently delete{" "}
          <span className="font-semibold" style={{ color: "#e2e8f0" }}>
            {user.name}
          </span>
          . This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-3 rounded-2xl text-sm font-semibold transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(226,232,240,0.7)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-5 py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-blue-600",
];

function Avatar({ name }: { name: string }) {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return (
    <div
      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENTS[idx]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── User Details Modal ──────────────────────────────────────────────────────

interface UserDetailsData {
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: "user" | "admin" | "sub-admin";
    isBlocked: boolean;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt?: string;
    lastLoginAt?: string;
    passwordChangedAt?: string;
    addresses?: Array<{
      label?: string;
      address: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      phone?: string;
    }>;
  };
  addresses?: Array<{
    label?: string;
    phone?: string;
    address: string;
    city?: string;
    state?: string;
    district?: string;
    division?: string;
    zip?: string;
  }>;
  stats: {
    totalOrders: number;
    totalSpent: number;
    statusCounts: {
      pending: number;
      confirmed: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      returned: number;
    };
  };
  recentOrders: Array<{
    _id: string;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod?: string;
    createdAt: string;
    itemsCount: number;
  }>;
}

function UserDetailsModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { apiFetch } = useAdminAuth();
  const [data, setData] = useState<UserDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch<{ success: boolean; data: UserDetailsData }>(
          `/admin/users/${userId}`,
        );
        if (mounted) setData(res.data);
      } catch (err: unknown) {
        if (mounted)
          setError(
            err instanceof Error ? err.message : "Failed to load details",
          );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [userId, apiFetch]);

  const formatDate = (iso?: string) => {
    if (!iso) return "Not recorded";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Not recorded";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
    >
      <div
        className="rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{
          background: "rgba(15,15,25,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(67,56,202,0.06))",
          }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              {data?.user?.name
                ? data.user.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase())
                    .join("")
                : "U"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {data?.user?.name || "User Details"}
                {data?.user?.isBlocked ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Blocked
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {data?.user?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 rounded-full animate-spin border-purple-500/30 border-t-purple-500 mb-3" />
              <p className="text-xs text-slate-400">
                Loading user profile & order analytics...
              </p>
            </div>
          ) : error ? (
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Total Orders
                  </p>
                  <p className="text-2xl font-black text-violet-300">
                    {data.stats.totalOrders}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Placed all-time
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Total Spent
                  </p>
                  <p className="text-2xl font-black text-emerald-300">
                    ৳{data.stats.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Net purchase total
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Last Login
                  </p>
                  <p
                    className="text-xs font-bold text-slate-200 mt-1 truncate"
                    title={formatDate(data.user.lastLoginAt)}
                  >
                    {data.user.lastLoginAt
                      ? formatDate(data.user.lastLoginAt)
                      : "Never Logged In"}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Password Changed
                  </p>
                  <p
                    className="text-xs font-bold text-slate-200 mt-1 truncate"
                    title={formatDate(data.user.passwordChangedAt)}
                  >
                    {data.user.passwordChangedAt
                      ? formatDate(data.user.passwordChangedAt)
                      : "Original Password"}
                  </p>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Order Status Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="block text-[10px] font-bold uppercase text-amber-400">
                      Pending
                    </span>
                    <span className="text-base font-black text-amber-300">
                      {data.stats.statusCounts.pending}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                    <span className="block text-[10px] font-bold uppercase text-violet-400">
                      Confirmed
                    </span>
                    <span className="text-base font-black text-violet-300">
                      {data.stats.statusCounts.confirmed}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <span className="block text-[10px] font-bold uppercase text-blue-400">
                      Shipped
                    </span>
                    <span className="text-base font-black text-blue-300">
                      {data.stats.statusCounts.shipped}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="block text-[10px] font-bold uppercase text-emerald-400">
                      Delivered
                    </span>
                    <span className="text-base font-black text-emerald-300">
                      {data.stats.statusCounts.delivered}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <span className="block text-[10px] font-bold uppercase text-rose-400">
                      Cancelled
                    </span>
                    <span className="text-base font-black text-rose-300">
                      {data.stats.statusCounts.cancelled}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                    <span className="block text-[10px] font-bold uppercase text-orange-400">
                      Returned
                    </span>
                    <span className="text-base font-black text-orange-300">
                      {data.stats.statusCounts.returned}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security & Contact Card */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Account History & Security
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">Phone Number:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {data.user.phone || "Not recorded"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">Account Created:</span>
                      <span className="font-semibold text-slate-200">
                        {formatDate(data.user.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">
                        Last Password Change:
                      </span>
                      <span className="font-semibold text-slate-200">
                        {formatDate(data.user.passwordChangedAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">Last Login Active:</span>
                      <span className="font-semibold text-slate-200">
                        {formatDate(data.user.lastLoginAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">
                        Email Verification:
                      </span>
                      <span
                        className={`font-bold ${data.user.isEmailVerified ? "text-emerald-400" : "text-amber-400"}`}
                      >
                        {data.user.isEmailVerified
                          ? "✓ Verified"
                          : "⏳ Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Saved & Order Addresses Card */}
                {(() => {
                  const addressList =
                    data.addresses && data.addresses.length > 0
                      ? data.addresses
                      : data.user.addresses || [];
                  return (
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Saved & Order Addresses ({addressList.length})
                        </h3>
                        {data.user.phone && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            📞 {data.user.phone}
                          </span>
                        )}
                      </div>
                      {addressList.length > 0 ? (
                        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                          {addressList.map((a, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white/[0.03] text-xs text-slate-300 border border-white/[0.05] space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                  {a.label || "Address"}
                                </span>
                                {a.phone && (
                                  <span className="text-[10px] font-mono font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-md">
                                    📞 {a.phone}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-300 leading-snug">
                                {a.address}
                              </p>
                              {(a.city || a.state || a.zip) && (
                                <p className="text-[11px] text-slate-400">
                                  {[a.city, a.state, a.zip]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic py-4 text-center">
                          No addresses or phone numbers recorded
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Recent Orders List */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recent Orders List
                </h3>
                {data.recentOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    This user has not placed any orders yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-slate-400 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Order ID</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Items</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Payment</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04] text-slate-300 font-medium">
                        {data.recentOrders.map((o) => (
                          <tr key={o._id} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 px-3 font-mono font-bold text-violet-300">
                              #{o._id.slice(-8).toUpperCase()}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {new Date(o.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {o.itemsCount} items
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`capitalize font-bold text-[11px] px-2.5 py-0.5 rounded-full border ${
                                  o.status === "delivered"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : o.status === "shipped"
                                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                      : o.status === "confirmed"
                                        ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                                        : o.status === "cancelled"
                                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                          : o.status === "returned"
                                            ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full border ${
                                  o.paymentStatus === "refunded" ||
                                  o.status === "returned"
                                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                    : o.paymentStatus === "cancelled" ||
                                        o.status === "cancelled"
                                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                      : o.paymentStatus === "paid"
                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                }`}
                              >
                                {o.paymentStatus === "refunded" ||
                                o.status === "returned"
                                  ? "Payment Returned"
                                  : o.paymentStatus === "cancelled" ||
                                      o.status === "cancelled"
                                    ? "Cancelled"
                                    : o.paymentStatus === "paid"
                                      ? "Paid"
                                      : "Verifying"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-slate-100">
                              ৳{o.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function UsersContent() {
  const { apiFetch } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      const res = await apiFetch<ApiResponse>(`/admin/users?${params}`);
      setUsers(res.data);
      setPagination({
        total: res.pagination.total,
        pages: res.pagination.pages,
      });
    } catch (e: unknown) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to load users",
      );
    } finally {
      setLoading(false);
    }
  }, [apiFetch, page, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/admin/users/${toDelete._id}`, { method: "DELETE" });
      showToast("success", `${toDelete.name} deleted`);
      setToDelete(null);
      fetchUsers();
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleBlock = async (user: User) => {
    setActionLoading(user._id + "-block");
    try {
      const res = await apiFetch<{
        success: boolean;
        data: User;
        message: string;
      }>(`/admin/users/${user._id}/block`, { method: "PUT" });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isBlocked: res.data.isBlocked } : u,
        ),
      );
      showToast("success", res.message);
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (user: User) => {
    const newRole: "user" | "admin" | "sub-admin" =
      user.role === "user"
        ? "sub-admin"
        : user.role === "sub-admin"
          ? "admin"
          : "user";
    setActionLoading(user._id + "-role");
    try {
      await apiFetch(`/admin/users/${user._id}`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)),
      );
      const roleLabel =
        newRole === "admin"
          ? "Admin"
          : newRole === "sub-admin"
            ? "Sub-Admin"
            : "Customer";
      showToast("success", `${user.name} role updated to ${roleLabel}`);
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Users &amp; Roles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {users.length} registered {users.length !== 1 ? "accounts" : "account"} in platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Filter users by name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-xs whitespace-nowrap"
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
                strokeWidth={2.5}
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* Users Table Container */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <svg
              className="w-12 h-12 mb-3 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <p className="text-sm font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/8 text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-white/[0.02] transition-colors h-16 ${user.isBlocked ? "opacity-60" : ""}`}
                  >
                    <td className="px-5 py-3.5">
                      <div
                        onClick={() => setSelectedUserId(user._id)}
                        className="flex items-center gap-3 cursor-pointer group/user"
                        title="Click to view user details"
                      >
                        <Avatar name={user.name} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-100 group-hover/user:text-violet-300 transition-colors truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${
                          user.role === "admin"
                            ? "bg-violet-950/40 text-violet-300 border-violet-500/30"
                            : user.role === "sub-admin"
                              ? "bg-sky-950/40 text-sky-300 border-sky-500/30"
                              : "bg-white/[0.04] text-slate-400 border-white/10"
                        }`}
                      >
                        {user.role === "sub-admin" ? "Sub-Admin" : user.role === "admin" ? "Admin" : "Customer"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/40 text-rose-400 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedUserId(user._id)}
                          title="View user details and analytics"
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border bg-violet-950/30 text-violet-300 border-violet-500/20 hover:bg-violet-900/40"
                        >
                          Details
                        </button>
                        {user.role === "user" && (
                          <button
                            type="button"
                            onClick={() => handleBlock(user)}
                            disabled={actionLoading === user._id + "-block"}
                            title={user.isBlocked ? "Unblock user" : "Block user"}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border disabled:opacity-50 ${
                              user.isBlocked
                                ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/20 hover:bg-emerald-900/40"
                                : "bg-amber-950/30 text-amber-400 border-amber-500/20 hover:bg-amber-900/40"
                            }`}
                          >
                            {actionLoading === user._id + "-block" ? "..." : user.isBlocked ? "Unblock" : "Block"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(user)}
                          disabled={actionLoading === user._id + "-role"}
                          title="Click to switch user role"
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 disabled:opacity-50"
                        >
                          {actionLoading === user._id + "-role" ? "..." : "Change Role"}
                        </button>
                        {user.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() => setToDelete(user)}
                            title="Delete user account"
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-500/20"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <p className="text-sm" style={{ color: "rgba(148,163,184,0.5)" }}>
              Page <span className="font-bold text-slate-300">{page}</span> of{" "}
              {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(226,232,240,0.7)",
                }}
              >
                ← Prev
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(226,232,240,0.7)",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(user) => {
            setShowCreate(false);
            showToast("success", `${user.name} created successfully`);
            fetchUsers();
          }}
        />
      )}

      {toDelete && (
        <DeleteModal
          user={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminAuthGuard>
      <UsersContent />
    </AdminAuthGuard>
  );
}
