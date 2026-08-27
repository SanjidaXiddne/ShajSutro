"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getApiBase } from "@/lib/apiBase";
import Logo from "@/components/layout/Logo";

const API = getApiBase();

interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  createdAt?: string;
}

export default function AdminSubscribersPage() {
  const { token } = useAdminAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [activeSubscribers, setActiveSubscribers] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState<"active" | "all">("active");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBadge, setBroadcastBadge] = useState("SPECIAL OFFER");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastBannerUrl, setBroadcastBannerUrl] = useState("");
  const [broadcastCtaText, setBroadcastCtaText] = useState("SHOP THE SALE NOW");
  const [broadcastCtaUrl, setBroadcastCtaUrl] = useState("https://shajsutrov1.vercel.app/shop");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/admin/subscribers?page=${page}&limit=20&search=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribers(data.data || []);
        setTotalSubscribers(data.meta?.total || 0);
        setActiveSubscribers(data.meta?.activeCount || 0);
        setTotalPages(data.meta?.pages || 1);
      }
    } catch (err) {
      console.error("Failed to load subscribers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [token, page, search]);

  const handleToggleStatus = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API}/api/admin/subscribers/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchSubscribers();
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    setActionLoading(id);
    try {
      const res = await fetch(`${API}/api/admin/subscribers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchSubscribers();
      }
    } catch (err) {
      console.error("Failed to delete subscriber", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = "ID,Email,Status,SubscribedAt\n";
    const rows = subscribers
      .map(
        (s) =>
          `"${s._id}","${s.email}","${s.isActive ? "Active" : "Inactive"}","${new Date(s.subscribedAt).toISOString()}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shajsutro-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!broadcastSubject.trim() || !broadcastTitle.trim() || !broadcastMessage.trim()) {
      setBroadcastError("Subject, Title, and Message Body are required.");
      return;
    }

    const targetCount = broadcastTarget === "active" ? activeSubscribers : totalSubscribers;
    if (targetCount === 0) {
      setBroadcastError("No subscribers found matching the target criteria.");
      return;
    }

    if (!confirm(`Are you sure you want to send this email blast to ${targetCount} subscribers?`)) {
      return;
    }

    setSendingBroadcast(true);
    setBroadcastError(null);
    setBroadcastResult(null);

    try {
      const res = await fetch(`${API}/api/admin/subscribers/broadcast`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: broadcastSubject,
          badgeText: broadcastBadge,
          title: broadcastTitle,
          messageBody: broadcastMessage,
          bannerImageUrl: broadcastBannerUrl,
          ctaButtonText: broadcastCtaText,
          ctaButtonUrl: broadcastCtaUrl,
          target: broadcastTarget,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to send broadcast email");
      }

      setBroadcastResult(
        `🎉 Successfully sent promotional email to ${data.data?.sentCount || targetCount} subscribers!`
      );
    } catch (err: any) {
      setBroadcastError(err.message || "Failed to send broadcast email.");
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 tracking-wide">
              Newsletter Directory & Mailer
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Subscribers List
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage subscribers and send promotional emails & offer blasts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowBroadcastModal(true);
              setBroadcastResult(null);
              setBroadcastError(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold border border-violet-400/20 shadow-xs flex items-center gap-2 transition-all"
          >
            <svg className="w-4 h-4 text-violet-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span className="whitespace-nowrap">Broadcast Promo Mail</span>
          </button>

          <button
            type="button"
            onClick={fetchSubscribers}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Subscribers</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">{totalSubscribers}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Active Subscribers</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{activeSubscribers}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Inactive Subscribers</p>
              <p className="text-2xl font-bold text-slate-300 mt-1">{totalSubscribers - activeSubscribers}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/8 rounded-2xl p-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search email address..."
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        <p className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{subscribers.length}</span> of <span className="font-semibold text-slate-200">{totalSubscribers}</span> subscribers
        </p>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/8 text-slate-400 uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Subscription Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      Loading subscribers...
                    </div>
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub, index) => (
                  <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 font-mono">
                      {(page - 1) * 20 + index + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {sub.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-200">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(sub.subscribedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={sub.isActive}
                        onClick={() => handleToggleStatus(sub._id)}
                        disabled={actionLoading === sub._id}
                        title={sub.isActive ? "Click to deactivate subscriber" : "Click to activate subscriber"}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          sub.isActive
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50"
                            : "bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/[0.08]"
                        }`}
                      >
                        <span
                          className={`relative inline-block w-6 h-3.5 rounded-full transition-colors ${
                            sub.isActive ? "bg-emerald-500" : "bg-slate-700"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform ${
                              sub.isActive ? "translate-x-2.5" : "translate-x-0"
                            }`}
                          />
                        </span>
                        <span>{sub.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(sub._id)}
                        disabled={actionLoading === sub._id}
                        aria-label={`Delete subscriber ${sub.email}`}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/8 flex items-center justify-between bg-white/[0.01]">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-200 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400 font-medium">
              Page <span className="font-bold text-slate-200">{page}</span> of <span className="font-bold text-slate-200">{totalPages}</span>
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-200 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ── BROADCAST PROMO MAIL MODAL ── */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[82vh] sm:max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header (Fixed at Top) */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/40 flex items-center justify-between shrink-0 z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
                    Bulk Promotional Email Blast
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  📢 Send Broadcast Email to Subscribers
                </h2>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs (Fixed below Header) */}
            <div className="flex border-b border-slate-800 bg-slate-950/80 px-6 shrink-0 z-10">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`py-3 px-5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "edit"
                    ? "border-violet-500 text-violet-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                ✏️ Compose Email
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`py-3 px-5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "preview"
                    ? "border-violet-500 text-violet-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                👁️ Live Email Preview
              </button>
            </div>

            {/* Form Wrap with Scrollable Body & Sticky Action Footer */}
            <form onSubmit={handleSendBroadcast} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {broadcastResult && (
                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <span>{broadcastResult}</span>
                  </div>
                )}

                {broadcastError && (
                  <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <span>⚠️ {broadcastError}</span>
                  </div>
                )}

                {activeTab === "edit" ? (
                  <div className="space-y-4">
                    {/* Target Audience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setBroadcastTarget("active")}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                          broadcastTarget === "active"
                            ? "bg-violet-500/15 border-violet-500/50 text-white"
                            : "bg-slate-950/60 border-slate-800 text-slate-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="target"
                          checked={broadcastTarget === "active"}
                          onChange={() => setBroadcastTarget("active")}
                          className="text-violet-500 focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-bold">Active Subscribers Only</p>
                          <p className="text-[11px] text-slate-400">{activeSubscribers} recipients</p>
                        </div>
                      </label>

                      <label
                        onClick={() => setBroadcastTarget("all")}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                          broadcastTarget === "all"
                            ? "bg-violet-500/15 border-violet-500/50 text-white"
                            : "bg-slate-950/60 border-slate-800 text-slate-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="target"
                          checked={broadcastTarget === "all"}
                          onChange={() => setBroadcastTarget("all")}
                          className="text-violet-500 focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-bold">All Subscribers (Including Inactive)</p>
                          <p className="text-[11px] text-slate-400">{totalSubscribers} recipients</p>
                        </div>
                      </label>
                    </div>

                    {/* Email Subject */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Email Subject Line <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={broadcastSubject}
                        onChange={(e) => setBroadcastSubject(e.target.value)}
                        placeholder="e.g., 🔥 Exclusive 25% Off Spring Sale — ShajSutro"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    {/* Badge Text & Title */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Pill Badge Text (Optional)
                        </label>
                        <input
                          type="text"
                          value={broadcastBadge}
                          onChange={(e) => setBroadcastBadge(e.target.value)}
                          placeholder="e.g., SPECIAL OFFER or NEW ARRIVAL"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Headline / Main Title <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={broadcastTitle}
                          onChange={(e) => setBroadcastTitle(e.target.value)}
                          placeholder="e.g., Elevate Your Wardrobe Today"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>

                    {/* Poster Banner Image URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Poster Banner Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={broadcastBannerUrl}
                        onChange={(e) => setBroadcastBannerUrl(e.target.value)}
                        placeholder="e.g., https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    {/* Message Body */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Message Content Body <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Write your email body here. New lines will automatically format into paragraphs."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 leading-relaxed"
                      />
                    </div>

                    {/* CTA Button Label & Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Call-To-Action Button Text
                        </label>
                        <input
                          type="text"
                          value={broadcastCtaText}
                          onChange={(e) => setBroadcastCtaText(e.target.value)}
                          placeholder="e.g., SHOP THE SALE NOW"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Button Link URL
                        </label>
                        <input
                          type="url"
                          value={broadcastCtaUrl}
                          onChange={(e) => setBroadcastCtaUrl(e.target.value)}
                          placeholder="e.g., https://shajsutrov1.vercel.app/shop?badge=Sale"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LIVE EMAIL PREVIEW CONTAINER */
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-hidden">
                    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-900 border border-slate-200">
                      {/* Top Brand Accent Bar */}
                      <div className="h-1.5 bg-gradient-to-r from-[#00B14F] via-emerald-400 to-[#FF6200]" />

                      {/* Prominent Centered Logo Header */}
                      <div className="p-6 text-center border-b border-slate-100 bg-white">
                        <div className="flex justify-center">
                          <Logo size="xl" href="" />
                        </div>
                      </div>

                      {/* Email Body Preview */}
                      <div className="p-6">
                        {broadcastBadge && (
                          <div className="text-center mb-3">
                            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#FF6200] to-orange-600 text-white font-black text-[10px] uppercase tracking-wider rounded-full shadow-md shadow-orange-500/20">
                              🔥 {broadcastBadge}
                            </span>
                          </div>
                        )}

                        <h2 className="text-2xl font-black text-center text-slate-900 mb-2 tracking-tight leading-tight">
                          {broadcastTitle || "Your Offer Title Here"}
                        </h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-[#00B14F] to-[#FF6200] mx-auto mb-5 rounded-full" />

                        {broadcastBannerUrl && (
                          <div className="mb-5 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={broadcastBannerUrl} alt="Preview" className="w-full h-48 object-cover" />
                          </div>
                        )}

                        {/* Styled Message Body Box */}
                        <div className="bg-slate-50 border-l-4 border-[#00B14F] border-t border-r border-b border-slate-200 rounded-r-xl p-4 mb-5 text-xs text-slate-700 leading-relaxed space-y-2">
                          {(broadcastMessage || "Your promotional offer message body will appear here...")
                            .split("\n")
                            .filter(Boolean)
                            .map((p, idx) => (
                              <p key={idx}>{p}</p>
                            ))}
                        </div>

                        {/* Store Value Signals */}
                        <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-6 text-center text-[10px] text-slate-600 font-medium">
                          <div className="border-r border-slate-200 pr-1">
                            <p className="text-sm mb-0.5">🚚</p>
                            <p className="font-bold text-slate-900">Fast Delivery</p>
                            <p className="text-[9px] text-slate-500">3-5 Days in BD</p>
                          </div>
                          <div className="border-r border-slate-200 px-1">
                            <p className="text-sm mb-0.5">✨</p>
                            <p className="font-bold text-slate-900">100% Genuine</p>
                            <p className="text-[9px] text-slate-500">Quality Checked</p>
                          </div>
                          <div className="pl-1">
                            <p className="text-sm mb-0.5">🔒</p>
                            <p className="font-bold text-slate-900">Safe Payments</p>
                            <p className="text-[9px] text-slate-500">COD & MFS</p>
                          </div>
                        </div>

                        {broadcastCtaText && (
                          <div className="text-center">
                            <span className="inline-block bg-gradient-to-r from-[#FF6200] to-orange-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-full shadow-lg shadow-orange-500/30">
                              {broadcastCtaText} &rarr;
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="bg-[#0f172a] p-4 text-center text-[10px] text-slate-400 border-t border-slate-800">
                        <p className="font-bold text-slate-200 mb-1">ShajSutro • Happy Shopping</p>
                        <p className="text-slate-500">Dhaka, Bangladesh • shajsutrov1.vercel.app</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer (Fixed at Bottom) */}
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {sendingBroadcast ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Broadcast...
                    </>
                  ) : (
                    <>
                      <span>🚀</span> Send Email Blast Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
