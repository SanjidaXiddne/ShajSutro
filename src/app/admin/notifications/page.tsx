"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ChangeEvent, DragEvent, useEffect, useState } from "react";

interface NotificationItem {
  _id: string;
  title?: string;
  message?: string;
  type: "discount" | "special_offer" | "announcement" | "product_discount" | "hero_banner";
  image?: string;
  link?: string;
  buttonText?: string;
  badgeText?: string;
  promoCode?: string;
  duration?: number;
  isActive: boolean;
  createdAt: string;
}

type NotificationForm = {
  title: string;
  message: string;
  type: "discount" | "special_offer" | "announcement" | "product_discount" | "hero_banner";
  image: string;
  link: string;
  buttonText: string;
  badgeText: string;
  promoCode: string;
  duration: number;
  isActive: boolean;
};

const EMPTY_FORM: NotificationForm = {
  title: "",
  message: "",
  type: "hero_banner",
  image: "",
  link: "",
  buttonText: "",
  badgeText: "",
  promoCode: "",
  duration: 5,
  isActive: true,
};

const TYPE_CONFIG = {
  hero_banner: {
    label: "Home Banner",
    sub: "Full-Width Banner",
    icon: "🖼️",
    badgeBg: "bg-emerald-900/30 border-emerald-500/30 text-emerald-400",
    activeBorder: "border-emerald-500 bg-emerald-900/20 ring-2 ring-emerald-500/20",
    btnBg: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
  },
  special_offer: {
    label: "Special Offer",
    sub: "Special Offer",
    icon: "🔥",
    badgeBg: "bg-amber-900/30 border-amber-500/30 text-amber-400",
    activeBorder: "border-amber-500 bg-amber-900/20 ring-2 ring-amber-500/20",
    btnBg: "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
  },
  discount: {
    label: "Special Discount",
    sub: "Discount Offer",
    icon: "🎁",
    badgeBg: "bg-rose-900/30 border-rose-500/30 text-rose-400",
    activeBorder: "border-rose-500 bg-rose-900/20 ring-2 ring-rose-500/20",
    btnBg: "bg-gradient-to-r from-rose-500 to-pink-600 text-white",
  },
  product_discount: {
    label: "Product Offer",
    sub: "Product Discount",
    icon: "🏷️",
    badgeBg: "bg-purple-900/30 border-purple-500/30 text-purple-400",
    activeBorder: "border-purple-500 bg-purple-900/20 ring-2 ring-purple-500/20",
    btnBg: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
  },
  announcement: {
    label: "Announcement",
    sub: "Announcement",
    icon: "📢",
    badgeBg: "bg-blue-900/30 border-blue-500/30 text-blue-400",
    activeBorder: "border-blue-500 bg-blue-900/20 ring-2 ring-blue-500/20",
    btnBg: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
  },
};

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-3 ${
        type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? (
        <svg
          className="w-4 h-4 flex-shrink-0"
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
          className="w-4 h-4 flex-shrink-0"
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

function NotificationsContent() {
  const { apiFetch } = useAdminAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NotificationItem | null>(null);
  const [form, setForm] = useState<NotificationForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"file" | "url">("file");
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: NotificationItem[];
      }>("/notifications");
      if (res.success) {
        setNotifications(res.data);
      }
    } catch {
      showToast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (item: NotificationItem) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      message: item.message || "",
      type: item.type,
      image: item.image || "",
      link: item.link || "",
      buttonText: item.buttonText || "",
      badgeText: item.badgeText || "",
      promoCode: item.promoCode || "",
      duration: item.duration || 5,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasTitle = Boolean(form.title.trim());
    const hasMessage = Boolean(form.message.trim());
    const hasImage = Boolean(form.image.trim());

    if (!hasTitle && !hasMessage && !hasImage) {
      showToast("Please provide a title, message, or an image", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await apiFetch(`/notifications/${editingItem._id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        showToast("Notification updated successfully!");
      } else {
        await apiFetch("/notifications", {
          method: "POST",
          body: JSON.stringify(form),
        });
        showToast("Notification created successfully!");
      }
      setModalOpen(false);
      fetchNotifications();
    } catch {
      showToast("Failed to save notification", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: NotificationItem) => {
    try {
      await apiFetch(`/notifications/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === item._id ? { ...n, isActive: !n.isActive } : n,
        ),
      );
      showToast(
        `Notification ${!item.isActive ? "activated" : "paused"} successfully!`,
      );
    } catch {
      showToast("Failed to toggle notification status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification popup?"))
      return;
    setDeletingId(id);
    try {
      await apiFetch(`/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast("Notification deleted!");
    } catch {
      showToast("Failed to delete notification", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const activeTypeCfg = TYPE_CONFIG[form.type] || TYPE_CONFIG.special_offer;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Notifications &amp; Popup Panel
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create discount offers &amp; product alerts that show as interactive store popups.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 flex-shrink-0"
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
          Create New Notification
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-900/30 text-violet-400 flex items-center justify-center text-xl shrink-0">
            🔔
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">
              Total Notifications
            </p>
            <p className="text-2xl font-bold text-slate-100 mt-0.5">
              {notifications.length}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-900/30 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            ✨
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">
              Active Store Popups
            </p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">
              {notifications.filter((n) => n.isActive).length}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-900/30 text-amber-400 flex items-center justify-center text-xl shrink-0">
            ⏸️
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">
              Paused / Drafts
            </p>
            <p className="text-2xl font-bold text-slate-300 mt-0.5">
              {notifications.filter((n) => !n.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {/* Notifications List Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Notifications List
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            The latest active notification will pop up for customers visiting the store.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white/[0.02] border border-white/8 rounded-2xl">
            <svg
              className="w-8 h-8 animate-spin text-violet-400 mb-3"
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
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
            <div className="w-14 h-14 rounded-full bg-violet-900/30 text-violet-400 flex items-center justify-center text-2xl mx-auto mb-3">
              📢
            </div>
            <p className="text-base font-bold text-slate-200">
              No notifications created yet
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click &quot;Create New Notification&quot; to publish a discount
              offer or special announcement.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {notifications.map((item) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.special_offer;
              return (
                <div
                  key={item._id}
                  className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    item.isActive
                      ? "bg-white/[0.03] border-white/10 hover:border-violet-500/40"
                      : "bg-white/[0.015] border-white/5 opacity-60"
                  }`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${cfg.badgeBg}`}
                      >
                        {cfg.icon} {cfg.label}
                      </span>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5">
                          ⏱️ {item.duration || 5}s
                        </span>
                        {/* Toggle Switch */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.isActive}
                          onClick={() => handleToggleActive(item)}
                          title={item.isActive ? "Click to pause notification" : "Click to activate notification"}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            item.isActive ? "bg-emerald-500" : "bg-slate-700"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              item.isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Body Row */}
                    <div className="flex gap-4 items-start">
                      {item.image ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/[0.04] flex-shrink-0 border border-white/8 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.title || "Notification"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-violet-900/20 border border-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 text-3xl shadow-inner">
                          {cfg.icon}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-100 truncate">
                          {item.title || (item.image ? "🖼️ Image Only Notification" : "Notification")}
                        </h4>
                        {item.message ? (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                        ) : item.image ? (
                          <p className="text-xs text-slate-400 mt-1 italic">
                            (Image banner popup notification)
                          </p>
                        ) : null}
                        {item.promoCode && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-amber-900/30 text-amber-400 border border-amber-500/30">
                            🏷️ Code: {item.promoCode}
                          </div>
                        )}
                        {item.link && (
                          <div className="mt-1 text-xs font-medium text-violet-400 truncate">
                            🔗 {item.link}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        aria-label={`Edit ${item.title || "notification"}`}
                        className="px-4 py-2 min-h-[38px] text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition-all border border-white/10 flex items-center justify-center"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        aria-label={`Delete ${item.title || "notification"}`}
                        className="px-4 py-2 min-h-[38px] text-xs font-semibold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 rounded-xl transition-all disabled:opacity-50 border border-rose-500/20 flex items-center justify-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Form Modal with Live Storefront Preview */}
      {modalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden my-6 relative z-10 animate-in zoom-in-95 duration-200" style={{ background: "rgba(15,15,25,0.98)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {/* Modal Header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: "rgba(124,58,237,0.08)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                  Notification Builder
                </span>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-100">
                  {editingItem
                    ? "Edit Notification"
                    : "Create New Notification"}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.8)" }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Grid: Form (Left) + Live Preview (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Form Section */}
              <form
                onSubmit={handleSave}
                className="lg:col-span-7 p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto"
              >
                {/* 1. Type Selector Cards */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    1. Notification Type
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(
                      Object.keys(TYPE_CONFIG) as Array<
                        keyof typeof TYPE_CONFIG
                      >
                    ).map((key) => {
                      const cfg = TYPE_CONFIG[key];
                      const isSelected = form.type === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setForm({ ...form, type: key })}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? cfg.activeBorder
                              : "border-white/8 hover:border-white/20 bg-white/[0.02]"
                          }`}
                        >
                          <span className="text-xl">{cfg.icon}</span>
                          <div>
                            <p className="text-xs font-extrabold text-slate-100">
                              {cfg.label}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400">
                              {cfg.sub}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Title */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    2. Notification Title (Optional if Image added)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50% Special Eid Discount Offer!"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 text-sm font-semibold focus:outline-none focus:border-violet-500/60 bg-white/[0.05] text-slate-100"
                  />
                </div>

                {/* 3. Message */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    3. Message / Details (Optional if Image added)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Enjoy special discounts on our new collection. Use code: SHAJ50"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 text-sm focus:outline-none focus:border-violet-500/60 bg-white/[0.05] text-slate-100 resize-none"
                  />
                </div>

                {/* 4. Enhanced Image Upload / URL */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                      4. Banner Image (Upload / URL)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setImageInputMode("file")}
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                          imageInputMode === "file"
                            ? "bg-violet-900/40 text-violet-300 border border-violet-500/30"
                            : "text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode("url")}
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                          imageInputMode === "url"
                            ? "bg-violet-900/40 text-violet-300 border border-violet-500/30"
                            : "text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {imageInputMode === "file" ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                        isDragging
                          ? "border-violet-500 bg-violet-900/20"
                          : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                      }`}
                    >
                      <input
                        type="file"
                        id="form-img-file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="form-img-file"
                        className="cursor-pointer block"
                      >
                        <div className="w-10 h-10 rounded-full bg-violet-900/30 text-violet-400 flex items-center justify-center mx-auto mb-2">
                          📸
                        </div>
                        <p className="text-xs font-bold text-slate-300">
                          Select an image file or drag &amp; drop here
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG, WEBP (Max 5MB)
                        </p>
                      </label>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="https://example.com/banner.jpg"
                      value={form.image}
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl border border-white/10 text-xs focus:outline-none focus:border-violet-500/60 bg-white/[0.05] text-slate-100"
                    />
                  )}

                  {form.image && (
                    <div className="mt-3 flex items-center gap-3 p-2 bg-white/[0.04] rounded-2xl border border-white/8">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.image}
                          alt="Upload preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-300 truncate">
                          Image added
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Ready to display on modal banner
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="px-3 py-1 bg-rose-900/30 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/30 hover:bg-rose-900/50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Target Link & Button Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                      5. Button Link
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /shop?badge=Sale"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-white/10 text-sm focus:outline-none focus:border-violet-500/60 bg-white/[0.05] text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                      6. Button Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shop The Sale"
                      value={form.buttonText}
                      onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-white/10 text-sm focus:outline-none focus:border-violet-500/60 bg-white/[0.05] text-slate-100"
                    />
                  </div>
                </div>

                {/* Badge Tag Text */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    7. Top Tag / Badge Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LIMITED SEASON RELEASE or EID SPECIAL"
                    value={form.badgeText}
                    onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 text-sm focus:outline-none focus:border-violet-500/60 bg-white/[0.05] text-slate-100 uppercase tracking-wider"
                  />
                </div>

                {/* 6. Promo Code */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    6. Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SHAJ20 or EID50"
                    value={form.promoCode}
                    onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 text-sm font-mono font-bold focus:outline-none focus:border-violet-500/60 bg-white/[0.05] text-amber-400 uppercase tracking-wider"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 font-light">
                    If added, customers will get a 1-click Copy Promo Code button on the notification card &amp; popup modal.
                  </p>
                </div>

                {/* 6. Duration & Active */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                      6. Popup Timer Duration
                    </label>
                    <div className="flex items-center gap-2">
                      {[3, 5, 10, 15].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setForm({ ...form, duration: sec })}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                            form.duration === sec
                              ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                              : "bg-white/[0.04] text-slate-400 border-white/8 hover:bg-white/[0.08]"
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                      7. Active Status
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, isActive: !form.isActive })
                      }
                      className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                        form.isActive
                          ? "bg-emerald-900/30 border-emerald-500/30 text-emerald-400"
                          : "bg-white/[0.04] border-white/8 text-slate-500"
                      }`}
                    >
                      <span>
                        {form.isActive
                          ? "🟢 Active (Show in Store)"
                          : "⚪ Paused (Hidden)"}
                      </span>
                      <span
                        className={`w-3 h-3 rounded-full ${form.isActive ? "bg-emerald-500" : "bg-slate-600"}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-3 rounded-2xl border border-white/8 text-slate-300 font-bold text-sm hover:bg-white/[0.04]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
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
                    {editingItem
                      ? "Update Notification"
                      : "Publish Notification"}
                  </button>
                </div>
              </form>

              {/* Right Side Live Store Preview */}
              <div className="lg:col-span-5 bg-slate-950 p-6 sm:p-8 text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 relative">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Real-Time Store Modal Preview
                    </span>
                    <span className="text-[10px] text-slate-400 bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded-full">
                      {form.duration || 5}s duration
                    </span>
                  </div>

                  {/* Simulated Store Page Backdrop */}
                  <div className="relative rounded-2xl bg-slate-900/80 p-4 border border-white/10 shadow-2xl min-h-[360px] flex items-center justify-center overflow-hidden">
                    {/* Simulated background blur effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-violet-950/30 to-slate-900/50 backdrop-blur-sm pointer-events-none" />

                    {/* Live Preview Card */}
                    <div className="relative w-full max-w-xs bg-slate-950/90 text-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 ring-1 ring-white/10 z-10 animate-in zoom-in-95 duration-200">
                      {/* Top progress bar */}
                      <div className="h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 w-full" />

                      {/* Image Only Mode */}
                      {form.image && !form.title.trim() && !form.message.trim() && (
                        <div className="w-full relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={form.image}
                            alt="Preview"
                            className="w-full h-auto max-h-56 object-cover"
                          />
                          <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] text-slate-300 font-medium">Image Only Popup</span>
                            <div className={`px-3 py-1.5 text-center font-extrabold text-[10px] rounded-lg ${activeTypeCfg.btnBg}`}>
                              {form.link ? "Explore" : "Close"}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Banner + Text */}
                      {form.image && (form.title.trim() || form.message.trim()) && (
                        <>
                          <div className="w-full h-32 bg-slate-900 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={form.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border mb-1.5 ${activeTypeCfg.badgeBg}`}
                            >
                              {activeTypeCfg.icon} {activeTypeCfg.label}
                            </span>
                            {form.title && (
                              <h4 className="text-sm font-bold text-white line-clamp-1">
                                {form.title}
                              </h4>
                            )}
                            {form.message && (
                              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-snug">
                                {form.message}
                              </p>
                            )}
                            <div className="mt-3">
                              <div
                                className={`w-full py-2 text-center font-extrabold text-xs rounded-xl shadow-md ${activeTypeCfg.btnBg}`}
                              >
                                {form.link ? "Claim Offer" : "Got it"}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Text Only Mode */}
                      {!form.image && (
                        <>
                          <div className="w-full py-4 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white flex flex-col items-center justify-center border-b border-white/10">
                            <span className="text-2xl mb-1">
                              {activeTypeCfg.icon}
                            </span>
                            <span className="text-[10px] font-bold bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
                              {activeTypeCfg.label}
                            </span>
                          </div>
                          <div className="p-4">
                            <h4 className="text-sm font-bold text-white line-clamp-1">
                              {form.title || "Notification Title"}
                            </h4>
                            <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-snug">
                              {form.message ||
                                "Your special offer message and discount details will be displayed here."}
                            </p>
                            <div className="mt-3">
                              <div
                                className={`w-full py-2.5 text-center font-extrabold text-xs rounded-xl shadow-md ${activeTypeCfg.btnBg}`}
                              >
                                {form.link ? "Claim Offer" : "Got it"}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 text-center">
                  💡 Customers visiting the website will see this interactive popup modal.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNotificationsPage() {
  return (
    <AdminAuthGuard>
      <NotificationsContent />
    </AdminAuthGuard>
  );
}
