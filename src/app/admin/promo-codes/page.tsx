"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getApiBase } from "@/lib/apiBase";
import { useCallback, useEffect, useState } from "react";

const API = getApiBase();

// ─── Types ───────────────────────────────────────────────────────────────────

interface PromoCodeUsage {
  userId?: string;
  email?: string;
  orderId?: string;
  usedAt: string;
}

interface PromoCode {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  maxUses: number | null;
  usageLimitPerUser: number | null;
  isFirstOrderOnly: boolean;
  usedCount: number;
  usedByUsers?: PromoCodeUsage[];
  isActive: boolean;
  expiresAt: string | null;
  description: string;
  createdAt: string;
}

const EMPTY_FORM = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  maxUses: "",
  usageLimitPerUser: "1",
  isFirstOrderOnly: false,
  isActive: true,
  expiresAt: "",
  description: "",
};

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function PromoCodesPage() {
  return (
    <AdminAuthGuard>
      <PromoCodesContent />
    </AdminAuthGuard>
  );
}

function PromoCodesContent() {
  const { token } = useAdminAuth();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<PromoCode | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "first-order" | "expired">("all");
  const [viewingUsageCode, setViewingUsageCode] = useState<PromoCode | null>(null);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/promo-codes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCodes(data.data ?? []);
    } catch (err) {
      console.error("Failed to load promo codes:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setMsg(null);
    setShowForm(true);
  };

  const openQuickWelcome10 = () => {
    const existing = codes.find((c) => c.code === "WELCOME10");
    if (existing) {
      openEdit(existing);
    } else {
      setEditTarget(null);
      setForm({
        code: "WELCOME10",
        type: "percentage",
        value: "10",
        minOrderAmount: "0",
        maxDiscountAmount: "",
        maxUses: "",
        usageLimitPerUser: "1",
        isFirstOrderOnly: true,
        isActive: true,
        expiresAt: "",
        description: "Welcome offer: 10% OFF on first order for registered users (1 use per customer)",
      });
      setMsg(null);
      setShowForm(true);
    }
  };

  const openEdit = (c: PromoCode) => {
    setEditTarget(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrderAmount: String(c.minOrderAmount || ""),
      maxDiscountAmount: c.maxDiscountAmount !== null ? String(c.maxDiscountAmount) : "",
      maxUses: c.maxUses !== null ? String(c.maxUses) : "",
      usageLimitPerUser: c.usageLimitPerUser !== null && c.usageLimitPerUser !== undefined ? String(c.usageLimitPerUser) : "1",
      isFirstOrderOnly: Boolean(c.isFirstOrderOnly),
      isActive: c.isActive,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      description: c.description || "",
    });
    setMsg(null);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        usageLimitPerUser: form.usageLimitPerUser ? Number(form.usageLimitPerUser) : null,
        isFirstOrderOnly: Boolean(form.isFirstOrderOnly),
        isActive: Boolean(form.isActive),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        description: form.description.trim(),
      };

      const url = editTarget
        ? `${API}/api/promo-codes/${editTarget._id}`
        : `${API}/api/promo-codes`;
      const method = editTarget ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save promo code");
      }

      setMsg({
        type: "success",
        text: editTarget ? "Promo code updated successfully!" : "Promo code created successfully!",
      });
      fetchCodes();
      setTimeout(() => setShowForm(false), 1000);
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Error saving promo code";
      setMsg({ type: "error", text });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: PromoCode) => {
    try {
      await fetch(`${API}/api/promo-codes/${c._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      fetchCodes();
    } catch (err) {
      console.error("Failed to toggle promo status:", err);
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${codeName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await fetch(`${API}/api/promo-codes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCodes();
    } catch (err) {
      console.error("Failed to delete promo code:", err);
    }
  };

  // Filtered Codes
  const filteredCodes = codes.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "active") return c.isActive && !isExpired(c.expiresAt);
    if (filterType === "first-order") return c.isFirstOrderOnly;
    if (filterType === "expired") return isExpired(c.expiresAt);
    return true;
  });

  const activeCount = codes.filter((c) => c.isActive && !isExpired(c.expiresAt)).length;
  const firstOrderCount = codes.filter((c) => c.isFirstOrderOnly).length;
  const totalRedeemed = codes.reduce((acc, c) => acc + (c.usedCount || 0), 0);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Toolbar & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-semibold text-violet-400 tracking-wide">
              Discounts &amp; Vouchers Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Promo Codes &amp; Coupons
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage store-wide vouchers, 1st order welcome discounts, and customer usage limits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick WELCOME10 Preset Button */}
          <button
            type="button"
            onClick={openQuickWelcome10}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 flex-shrink-0"
            title="Create or configure the 1st Order WELCOME10 promo code"
          >
            <span>🎉</span>
            <span>Configure WELCOME10</span>
          </button>

          {/* Standard Create Button */}
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (All text font sizes >= 12px for accessibility) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Codes</span>
            <span className="p-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">🏷️</span>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{codes.length}</p>
          <p className="text-xs text-slate-400 mt-1">Configured coupons</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Active &amp; Live</span>
            <span className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-bold">✓</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{activeCount}</p>
          <p className="text-xs text-slate-400 mt-1">Ready for checkout</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">1st Order Only</span>
            <span className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/20 text-amber-400 text-xs font-bold">🎉</span>
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{firstOrderCount}</p>
          <p className="text-xs text-slate-400 mt-1">First-time buyers only</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-400">Total Redeemed</span>
            <span className="p-2 rounded-xl bg-violet-950/40 border border-violet-500/20 text-violet-400 text-xs font-bold">🛒</span>
          </div>
          <p className="text-2xl font-bold text-violet-400 mt-2">{totalRedeemed}</p>
          <p className="text-xs text-slate-400 mt-1">Total orders discounted</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-3 sm:p-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or description..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: `All (${codes.length})` },
            { id: "active", label: `Active (${activeCount})` },
            { id: "first-order", label: `1st Order (${firstOrderCount})` },
            { id: "expired", label: `Expired (${codes.filter((c) => isExpired(c.expiresAt)).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-slate-800 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading promo codes...</p>
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center text-2xl">
              🎟️
            </div>
            <p className="text-slate-200 font-bold text-sm">No promo codes found</p>
            <p className="text-xs text-slate-400 max-w-sm">
              {search
                ? `No promo codes matched "${search}". Try clearing your search query.`
                : 'Click "Configure WELCOME10" or "Create Promo Code" to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-xs">
                <tr>
                  <th className="px-5 py-4">Code &amp; Details</th>
                  <th className="px-5 py-4">Discount</th>
                  <th className="px-5 py-4">Eligibility / Limits</th>
                  <th className="px-5 py-4">Uses</th>
                  <th className="px-5 py-4">Expires</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCodes.map((c) => {
                  const expired = isExpired(c.expiresAt);
                  return (
                    <tr
                      key={c._id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        expired || !c.isActive ? "opacity-75" : ""
                      }`}
                    >
                      {/* Code & Description */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-violet-400 bg-violet-950/60 border border-violet-500/40 px-3 py-1 rounded-xl text-xs inline-block tracking-wider">
                            {c.code}
                          </span>

                          {c.isFirstOrderOnly && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                              <span>🎉</span> 1st Order Only
                            </span>
                          )}

                          {c.usageLimitPerUser && c.usageLimitPerUser > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-violet-500/10 border border-violet-500/30 text-violet-400">
                              <span>👤</span> {c.usageLimitPerUser}x / User
                            </span>
                          )}
                        </div>

                        {c.description ? (
                          <p className="text-slate-400 text-xs mt-1.5 line-clamp-1 max-w-sm">
                            {c.description}
                          </p>
                        ) : (
                          <p className="text-slate-500 text-xs mt-1 italic">No description</p>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase border ${
                              c.type === "percentage"
                                ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                                : "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {c.type === "percentage" ? "%" : "৳"}
                          </span>
                          <span className="text-slate-100 font-bold text-xs">
                            {c.type === "percentage" ? `${c.value}% OFF` : `৳${c.value} OFF`}
                          </span>
                        </div>
                        {c.maxDiscountAmount && c.maxDiscountAmount > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            Cap: <strong className="text-slate-200">৳{c.maxDiscountAmount}</strong>
                          </p>
                        )}
                      </td>

                      {/* Eligibility & Restrictions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="text-slate-300">
                            Min Order:{" "}
                            <strong className="text-slate-100">
                              {c.minOrderAmount > 0 ? `৳${c.minOrderAmount}` : "None"}
                            </strong>
                          </p>
                          <p className="text-xs text-slate-400">
                            Target:{" "}
                            <span className={c.isFirstOrderOnly ? "text-amber-400 font-semibold" : "text-slate-300"}>
                              {c.isFirstOrderOnly ? "First-time Buyers" : "All Customers"}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* Uses */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-bold text-slate-100 text-xs">{c.usedCount}</span>
                            <span className="text-slate-400 text-xs">/{c.maxUses ?? "∞"}</span>
                          </div>

                          {(c.usedByUsers && c.usedByUsers.length > 0) && (
                            <button
                              type="button"
                              onClick={() => setViewingUsageCode(c)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-md font-medium border border-slate-700 transition-colors"
                              title="View redeemed customer list"
                            >
                              List ({c.usedByUsers.length})
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Expiration */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {c.expiresAt ? (
                          <span
                            className={
                              expired
                                ? "text-rose-400 font-bold text-xs"
                                : "text-slate-300 text-xs"
                            }
                          >
                            {new Date(c.expiresAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            {expired && " (Expired)"}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">No Expiry</span>
                        )}
                      </td>

                      {/* Active Status Switch */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={c.isActive && !expired}
                          onClick={() => handleToggle(c)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            c.isActive && !expired ? "bg-emerald-500" : "bg-slate-700"
                          }`}
                          title={c.isActive ? "Click to deactivate code" : "Click to activate code"}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              c.isActive && !expired ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="px-3 py-1.5 font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs transition-all"
                            title="Edit code settings"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c._id, c.code)}
                            className="px-3 py-1.5 font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl text-xs transition-all"
                            title="Delete code"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            onClick={() => setShowForm(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
          />

          <div className="rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 relative z-10 animate-in zoom-in-95 duration-200 border border-slate-800 bg-slate-950">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 text-base">
                  🎟️
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {editTarget ? `Edit Promo Code — ${editTarget.code}` : "Create New Promo Code"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editTarget ? "Modify coupon rules, 1st order restrictions, and limits." : "Configure discount value, first-order rules, and customer limits."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
              {msg && (
                <div
                  className={`px-4 py-3 rounded-xl text-xs font-semibold border ${
                    msg.type === "success"
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              {/* ── HIGHLIGHT: First Order Only Feature Box ── */}
              <div className={`p-4 rounded-2xl border transition-all ${
                form.isFirstOrderOnly
                  ? "bg-amber-500/10 border-amber-500/40"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFirstOrderOnly}
                    onChange={(e) => setForm({ ...form, isFirstOrderOnly: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        🎉 First Order Only (1st Purchase per Registered Customer)
                      </span>
                      {form.isFirstOrderOnly && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      When enabled, this coupon can <strong>only be applied on a customer&apos;s 1st order</strong>. If the user already has prior completed orders, the system will prevent usage. Perfect for <strong>&quot;WELCOME10&quot;</strong> welcome gifts.
                    </p>
                  </div>
                </label>
              </div>

              {/* Core Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editTarget}
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })
                    }
                    placeholder="e.g. WELCOME10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950 disabled:opacity-50"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-violet-500 bg-slate-950"
                  >
                    <option value="percentage">Percentage (%) Discount</option>
                    <option value="fixed">Fixed Amount (৳) Discount</option>
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Discount Value * {form.type === "percentage" ? "(%)" : "(৳)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={form.type === "percentage" ? 100 : undefined}
                    step="0.01"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder={form.type === "percentage" ? "e.g. 10 for 10%" : "e.g. 200 for ৳200"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950"
                  />
                </div>

                {/* Per Customer Limit */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Per-Customer Usage Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimitPerUser}
                    onChange={(e) => setForm({ ...form, usageLimitPerUser: e.target.value })}
                    placeholder="1 (Default: 1x per user)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950"
                  />
                  <p className="text-xs text-slate-400 mt-1">Max times 1 user can use this code</p>
                </div>

                {/* Min Order */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Min Order Amount (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="0 = No minimum required"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950"
                  />
                  <p className="text-xs text-slate-400 mt-1">Minimum cart subtotal needed</p>
                </div>

                {/* Max Discount Cap */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Max Discount Cap (৳)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="Optional (e.g. 500)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950"
                  />
                  <p className="text-xs text-slate-400 mt-1">Cap percentage discount</p>
                </div>

                {/* Total Max Uses */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Total Maximum Uses
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    placeholder="Blank = Unlimited total"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950"
                  />
                  <p className="text-xs text-slate-400 mt-1">Global redemption ceiling</p>
                </div>

                {/* Expires At */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-violet-500 bg-slate-950"
                  />
                  <p className="text-xs text-slate-400 mt-1">Leave empty for no expiry</p>
                </div>

                {/* Active Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Coupon Status
                  </label>
                  <select
                    value={form.isActive ? "active" : "inactive"}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-violet-500 bg-slate-950"
                  >
                    <option value="active">Active (Usable on Checkout)</option>
                    <option value="inactive">Disabled / Paused</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Turn on/off instantly</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Coupon Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Welcome offer: 10% OFF on your first purchase"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Promo Code...
                    </>
                  ) : editTarget ? (
                    "Update Promo Code"
                  ) : (
                    "Save & Activate Code"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REDEEMED USERS MODAL ────────────────────────────────────────── */}
      {viewingUsageCode && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            onClick={() => setViewingUsageCode(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
          />

          <div className="rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-6 relative z-10 border border-slate-800 bg-slate-950">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Redemption History: {viewingUsageCode.code}
                </h3>
                <p className="text-xs text-slate-400">
                  {viewingUsageCode.usedByUsers?.length || 0} customer redemptions recorded
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewingUsageCode(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto space-y-2">
              {(!viewingUsageCode.usedByUsers || viewingUsageCode.usedByUsers.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No detailed redemption records yet.
                </p>
              ) : (
                viewingUsageCode.usedByUsers.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{u.email || "Registered User"}</p>
                      {u.orderId && (
                        <p className="text-xs text-slate-400 font-mono">Order: #{u.orderId.toString().slice(-6)}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(u.usedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingUsageCode(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
