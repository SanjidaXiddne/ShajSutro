"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAdminAuth } from "@/context/AdminAuthContext";
import React, { useEffect, useState } from "react";

type Tab = "profile" | "preferences" | "security" | "team";

const PERM_MODULES = [
  { key: "dashboard", label: "Dashboard", desc: "Analytics & store stats", icon: "📊" },
  { key: "products", label: "Products", desc: "Catalog & stock control", icon: "🏷️" },
  { key: "orders", label: "Orders", desc: "Order fulfillment & statuses", icon: "🛍️" },
  { key: "users", label: "Users", desc: "Customer account management", icon: "👤" },
  { key: "categories", label: "Categories", desc: "Category structure & tags", icon: "📁" },
  { key: "promoCodes", label: "Promo Codes", desc: "Checkout discount codes", icon: "🎟️" },
  { key: "notifications", label: "Notifications", desc: "Store popups & alerts", icon: "🔔" },
  { key: "jobs", label: "Jobs & Careers", desc: "Postings & candidate CVs", icon: "💼" },
  { key: "messages", label: "Messages", desc: "Customer contact inquiries", icon: "💬" },
] as const;

interface AdminTeamMember {
  _id: string;
  name: string;
  email: string;
  role: "admin";
  adminRole?: "root_admin" | "sub_admin";
  permissions?: Record<string, boolean>;
  createdAt?: string;
}

export default function AdminProfilePage() {
  const { admin, apiFetch, updateAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Avatar Gradient Preset State
  const [avatarGradient, setAvatarGradient] = useState("from-violet-600 to-indigo-600");
  const [avatarType, setAvatarType] = useState("gradient");
  const [avatarImage, setAvatarImage] = useState("");
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    const savedGrad = localStorage.getItem("admin_avatar_gradient");
    const savedType = localStorage.getItem("admin_avatar_type");
    const savedImg = localStorage.getItem("admin_avatar_image");
    if (savedGrad) setAvatarGradient(savedGrad);
    if (savedType) setAvatarType(savedType);
    if (savedImg) setAvatarImage(savedImg);
  }, []);

  const saveGradient = (grad: string) => {
    setAvatarGradient(grad);
    localStorage.setItem("admin_avatar_gradient", grad);
    window.dispatchEvent(new Event("storage"));
  };

  const saveAvatarType = (t: string) => {
    setAvatarType(t);
    localStorage.setItem("admin_avatar_type", t);
    window.dispatchEvent(new Event("storage"));
  };

  const saveAvatarImage = (url: string) => {
    setAvatarImage(url);
    localStorage.setItem("admin_avatar_image", url);
    window.dispatchEvent(new Event("storage"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file.");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        saveAvatarImage(event.target.result);
        saveAvatarType("image");
      } else {
        setAvatarError("Failed to read image file.");
      }
    };
    reader.onerror = () => {
      setAvatarError("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  // Profile Form State
  const [name, setName] = useState(admin?.name ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Preference Settings State
  const [prefs, setPrefs] = useState({
    dailySales: true,
    newOrders: true,
    auditLogs: false,
    compactTables: false,
    autoloadCharts: true,
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem("admin_prefs");
    if (savedPrefs) {
      try {
        setPrefs(JSON.parse(savedPrefs));
      } catch (e) {}
    }
  }, []);

  const togglePref = (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    localStorage.setItem("admin_prefs", JSON.stringify(updated));
  };

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Session info
  const [userAgentInfo, setUserAgentInfo] = useState({
    os: "Windows",
    browser: "Chrome",
    ip: "103.145.74.12",
  });

  // Team Access & Permission State
  const [teamMembers, setTeamMembers] = useState<AdminTeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null);
  const [teamMsg, setTeamMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTeamMembers = async () => {
    setTeamLoading(true);
    try {
      const data = await apiFetch<{ success: boolean; data: AdminTeamMember[] }>("/admin/team");
      if (data.success && Array.isArray(data.data)) {
        setTeamMembers(data.data);
      }
    } catch {
      // ignore
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "team") {
      fetchTeamMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleToggleMemberPerm = (memberId: string, permKey: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m._id !== memberId) return m;
        const currentPerms = m.permissions || {
          dashboard: true,
          products: true,
          orders: true,
          users: true,
          categories: true,
          promoCodes: true,
          notifications: true,
          jobs: true,
          messages: true,
        };
        return {
          ...m,
          permissions: {
            ...currentPerms,
            [permKey]: !currentPerms[permKey],
          },
        };
      })
    );
  };

  const handleMemberRoleChange = (memberId: string, newRole: "root_admin" | "sub_admin") => {
    setTeamMembers((prev) =>
      prev.map((m) => (m._id === memberId ? { ...m, adminRole: newRole } : m))
    );
  };

  const handleSaveMemberAccess = async (member: AdminTeamMember) => {
    setSavingMemberId(member._id);
    setTeamMsg(null);
    try {
      const data = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/users/${member._id}/permissions`,
        {
          method: "PUT",
          body: JSON.stringify({
            adminRole: member.adminRole || "sub_admin",
            permissions: member.permissions || {},
          }),
        }
      );
      if (data.success) {
        setTeamMsg({ type: "success", text: `Permissions updated for ${member.name}` });
      }
    } catch (err: any) {
      setTeamMsg({ type: "error", text: err.message ?? "Failed to save permissions" });
    } finally {
      setSavingMemberId(null);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent;
      let os = "Windows OS";
      let browser = "Web Browser";
      if (ua.indexOf("Mac") !== -1) os = "macOS";
      if (ua.indexOf("Linux") !== -1) os = "Linux";
      if (ua.indexOf("Android") !== -1) os = "Android";
      if (ua.indexOf("iPhone") !== -1) os = "iOS (iPhone)";

      if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
      else if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
      else if (ua.indexOf("Safari") !== -1) browser = "Safari";
      else if (ua.indexOf("Edge") !== -1) browser = "Microsoft Edge";

      setUserAgentInfo({
        os,
        browser,
        ip: "103.145.74.12",
      });
    }
  }, []);

  const GRADIENTS = [
    { name: "Royal Violet", value: "from-violet-600 to-indigo-600" },
    { name: "Electric Cyan", value: "from-blue-500 to-cyan-500" },
    { name: "Forest Emerald", value: "from-emerald-500 to-teal-600" },
    { name: "Crimson Rose", value: "from-rose-500 to-pink-600" },
    { name: "Sunset Amber", value: "from-amber-500 to-orange-500" },
  ];

  // Update profile details
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    if (!name || !email) {
      setProfileMessage({ type: "error", text: "Name and email are required." });
      return;
    }
    setProfileLoading(true);
    try {
      const data = await apiFetch<{
        success: boolean;
        message?: string;
        data?: { name: string; email: string };
      }>("/auth/me", {
        method: "PUT",
        body: JSON.stringify({ name, email }),
      });
      if (data.success) {
        updateAdmin({ name, email });
        setProfileMessage({
          type: "success",
          text: "Profile updated successfully.",
        });
      }
    } catch (err: any) {
      setProfileMessage({
        type: "error",
        text: err.message ?? "Failed to update profile.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Update password details
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "All fields are required." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const data = await apiFetch<{ success: boolean; message?: string }>("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (data.success) {
        setPasswordMessage({
          type: "success",
          text: "Password updated successfully.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err.message ?? "Failed to update password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <AdminAuthGuard>
      <div className="p-6 md:p-8 space-y-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Overview Card */}
          <div className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Profile Avatar Frame */}
              <div className="relative group select-none">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
                {avatarType === "image" && avatarImage ? (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 shadow-lg ring-1 ring-violet-500/40 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarImage} alt={admin.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-3xl font-black shadow-lg shrink-0`}>
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight leading-none" style={{ color: "#e2e8f0" }}>
                    {admin.name}
                  </h2>
                  <span className="inline-flex items-center self-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                    Root Admin
                  </span>
                </div>
                <p className="text-sm mt-1.5" style={{ color: "rgba(148,163,184,0.6)" }}>{admin.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs font-semibold" style={{ color: "rgba(148,163,184,0.5)" }}>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Account
                  </div>
                  <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div>Security Tier: Level 3</div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex gap-4 pt-6 md:pt-0 w-full md:w-auto justify-around" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="text-center px-4">
                <p className="text-2xl font-black text-slate-100">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>Uptime</p>
              </div>
              <div className="w-px h-8 self-center" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="text-center px-4">
                <p className="text-2xl font-black text-emerald-400">Active</p>
                <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>Status</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-6 overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {(
              [
                { id: "profile", label: "Account Info" },
                { id: "preferences", label: "Preferences" },
                { id: "security", label: "Password & Security" },
                { id: "team", label: "Team & Permissions" },
              ] as const
            )
              .filter(
                (tab) =>
                  tab.id !== "team" ||
                  (admin?.role === "admin" && admin?.adminRole !== "sub_admin")
              )
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm font-bold tracking-tight transition-all duration-200 relative ${
                    activeTab === tab.id
                      ? "text-violet-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded-full" />
                  )}
                </button>
              ))}
          </div>

          {/* Main Tab Content Panels */}
          <div className="transition-all duration-200">
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Account Settings Panel */}
                <div className="md:col-span-2 rounded-3xl p-6 md:p-8 space-y-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Account Details</h3>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.6)" }}>
                      Maintain your personal administrator details
                    </p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {profileMessage && (
                      <div
                        className={`px-4 py-3 rounded-xl text-xs font-semibold border ${
                          profileMessage.type === "success"
                            ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-900/20 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {profileMessage.text}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Administrator"
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-500/60"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. admin@shajsutro.com"
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-500/60"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                          Administrative Role
                        </label>
                        <input
                          type="text"
                          value="Administrator"
                          readOnly
                          disabled
                          className="w-full px-4 py-3 rounded-xl text-sm opacity-60 cursor-not-allowed"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.7)" }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                          Permissions Tier
                        </label>
                        <input
                          type="text"
                          value="Full Access (Root Owner)"
                          readOnly
                          disabled
                          className="w-full px-4 py-3 rounded-xl text-sm opacity-60 cursor-not-allowed"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.7)" }}
                        />
                      </div>
                    </div>

                    <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-md hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-60"
                      >
                        {profileLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Avatar customization sidebar */}
                <div className="rounded-3xl p-6 space-y-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Signature Avatar</h3>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.6)" }}>
                      Choose signature initial gradient or a custom photo
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 rounded-2xl border border-dashed border-white/10 gap-3" style={{ background: "rgba(255,255,255,0.01)" }}>
                    {avatarType === "image" && avatarImage ? (
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-900 shadow-lg ring-1 ring-violet-500/40 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={avatarImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            saveAvatarImage("");
                            saveAvatarType("gradient");
                          }}
                          className="absolute -top-1.5 -right-1.5 p-1.5 rounded-full bg-rose-900/40 text-rose-400 border border-rose-500/40 hover:bg-rose-900/60 shadow-sm transition-all"
                          title="Remove Photo"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-4xl font-black shadow-lg shrink-0`}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Avatar Type Selector Buttons */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                      Avatar Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <button
                        type="button"
                        onClick={() => saveAvatarType("gradient")}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${avatarType === "gradient" ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        Initial Gradient
                      </button>
                      <button
                        type="button"
                        onClick={() => saveAvatarType("image")}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${avatarType === "image" ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        Photo Image
                      </button>
                    </div>
                  </div>

                  {avatarType === "gradient" ? (
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                        Choose Preset Color
                      </label>
                      <div className="grid grid-cols-5 gap-2.5">
                        {GRADIENTS.map((grad) => {
                          const isSelected = avatarGradient === grad.value;
                          return (
                            <button
                              key={grad.name}
                              onClick={() => saveGradient(grad.value)}
                              title={grad.name}
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                                grad.value
                              } relative transition-all duration-200 hover:scale-105 active:scale-95 ${
                                isSelected
                                  ? "ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-900 scale-105"
                                  : ""
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute inset-0 flex items-center justify-center text-white">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Device Upload Zone */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                          Upload from Device
                        </label>
                        <label
                          htmlFor="avatar-file-upload"
                          className="w-full flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/60 text-xs font-bold transition-all cursor-pointer select-none group"
                          style={{ background: "rgba(255,255,255,0.01)" }}
                        >
                          <div className="p-2 rounded-xl bg-violet-900/30 text-violet-400 transition-all">
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
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                          </div>
                          <span className="text-center text-slate-300 group-hover:text-violet-400 transition-all">Choose local image file</span>
                          <span className="text-[9px] text-slate-400 font-normal">JPG, PNG, WEBP, or GIF up to 1.5MB</span>
                        </label>
                        <input
                          type="file"
                          id="avatar-file-upload"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>

                      {avatarError && (
                        <div className="px-3.5 py-2.5 rounded-xl border border-rose-500/30 bg-rose-900/20 text-[11px] font-medium text-rose-400 leading-normal">
                          {avatarError}
                        </div>
                      )}

                      {/* Divider */}
                      <div className="flex items-center gap-3">
                        <div className="h-px bg-white/5 flex-1" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">OR</span>
                        <div className="h-px bg-white/5 flex-1" />
                      </div>

                      {/* Profile Image URL */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                          Profile Image URL
                        </label>
                        <input
                          type="url"
                          value={avatarImage && avatarImage.startsWith("data:") ? "" : avatarImage}
                          onChange={(e) => {
                            setAvatarError(null);
                            saveAvatarImage(e.target.value);
                          }}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-500/60"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }}
                        />
                        <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                          Paste a public web address to set your administrative profile photo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="rounded-3xl p-6 md:p-8 space-y-8" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Preferences</h3>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.6)" }}>
                    Configure workspaces settings and notification triggers
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Notification Triggers */}
                  <div className="space-y-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                      Notification Preferences
                    </h4>

                    {/* Checkbox item 1 */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-200">Daily Sales Summaries</p>
                        <p className="text-xs text-slate-400 mt-0.5">Get a summarized dashboard stats email every morning.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={prefs.dailySales}
                          onChange={() => togglePref("dailySales")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                      </label>
                    </div>

                    {/* Checkbox item 2 */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-200">New Order Alerts</p>
                        <p className="text-xs text-slate-400 mt-0.5">Immediate notifications for customer transactions.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={prefs.newOrders}
                          onChange={() => togglePref("newOrders")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                      </label>
                    </div>

                    {/* Checkbox item 3 */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-200">Security Audit Logs</p>
                        <p className="text-xs text-slate-400 mt-0.5">Receive alert logs on new login devices or credentials changes.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={prefs.auditLogs}
                          onChange={() => togglePref("auditLogs")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                      </label>
                    </div>
                  </div>

                  {/* Panel Preferences */}
                  <div className="space-y-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                      Workspace Configurations
                    </h4>

                    {/* Checkbox item 4 */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-200">Autoload Analytics Charts</p>
                        <p className="text-xs text-slate-400 mt-0.5">Render charts immediately upon mounting the dashboard.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={prefs.autoloadCharts}
                          onChange={() => togglePref("autoloadCharts")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                      </label>
                    </div>

                    {/* Checkbox item 5 */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-200">Compact Tables Layout</p>
                        <p className="text-xs text-slate-400 mt-0.5">Display catalog and order tables in high density views.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={prefs.compactTables}
                          onChange={() => togglePref("compactTables")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Change Password Card */}
                <div className="md:col-span-2 rounded-3xl p-6 md:p-8 space-y-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Password Update</h3>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.6)" }}>
                      Ensure your dashboard credentials remain highly secure
                    </p>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {passwordMessage && (
                      <div
                        className={`px-4 py-3 rounded-xl text-xs font-semibold border ${
                          passwordMessage.type === "success"
                            ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-900/20 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {passwordMessage.text}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-500/60"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-500/60"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-500/60"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }}
                        />
                      </div>
                    </div>

                    <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-md hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-60"
                      >
                        {passwordLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Update Password"
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Audit and Active Sessions */}
                <div className="rounded-3xl p-6 space-y-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Security Audit</h3>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.6)" }}>
                      Active browser session details
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium" style={{ color: "rgba(148,163,184,0.6)" }}>Browser</span>
                        <span className="text-slate-200 font-bold">{userAgentInfo.browser}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium" style={{ color: "rgba(148,163,184,0.6)" }}>System</span>
                        <span className="text-slate-200 font-bold">{userAgentInfo.os}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium" style={{ color: "rgba(148,163,184,0.6)" }}>IP Address</span>
                        <span className="text-slate-400 font-mono font-bold">{userAgentInfo.ip}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium" style={{ color: "rgba(148,163,184,0.6)" }}>Location</span>
                        <span className="text-slate-200 font-bold">Dhaka, BD</span>
                      </div>
                      <div className="pt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <span>Active Now</span>
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl space-y-1" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                      <p className="text-xs font-bold text-amber-400">Login Alert</p>
                      <p className="text-[11px] text-amber-300/80 leading-relaxed font-light">
                        Multi-factor protection is automatically enforced on root admin actions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Access & Permissions Panel */}
            {activeTab === "team" && (
              <div className="rounded-3xl p-6 md:p-8 space-y-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                      Root Admin Access Management
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-100 tracking-tight mt-2">
                      Sub-Admin Role &amp; Permission Access
                    </h3>
                    <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>
                      Assign granular section access permissions for sub-admins. Root Admins have full unrestricted system control.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchTeamMembers}
                    className="px-4 py-2 text-slate-300 font-bold text-xs rounded-xl transition-colors self-start sm:self-auto flex items-center gap-1.5"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <svg className={`w-3.5 h-3.5 ${teamLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115.357-2m1.643 9a9 9 0 01-15.357 2" />
                    </svg>
                    Refresh Team
                  </button>
                </div>

                {teamMsg && (
                  <div
                    className={`px-4 py-3 rounded-2xl text-xs font-bold border ${
                      teamMsg.type === "success"
                        ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-400"
                        : "bg-rose-900/20 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {teamMsg.text}
                  </div>
                )}

                {teamLoading ? (
                  <div className="py-16 text-center text-slate-400">
                    <svg className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-xs font-bold text-slate-400">Loading team members &amp; permissions...</p>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-white/8" style={{ background: "rgba(255,255,255,0.01)" }}>
                    <p className="text-sm font-bold text-slate-300">No admin team members found</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {teamMembers.map((member) => {
                      const isMemberRoot = (!member.adminRole || member.adminRole === "root_admin");
                      const memberPerms = member.permissions || {
                        dashboard: true,
                        products: true,
                        orders: true,
                        users: true,
                        categories: true,
                        promoCodes: true,
                        notifications: true,
                        jobs: true,
                        messages: true,
                      };

                      return (
                        <div
                          key={member._id}
                          className="p-6 rounded-3xl space-y-5 transition-all"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          {/* Member Top Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-bold text-slate-100">{member.name}</h4>
                                  <span
                                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                                    style={isMemberRoot 
                                      ? { background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }
                                      : { background: "rgba(6,182,212,0.15)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.2)" }}
                                  >
                                    {isMemberRoot ? "Root Admin" : "Sub Admin"}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
                              </div>
                            </div>

                            {/* Role Select */}
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <div className="space-y-0.5">
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                                  Admin Role Level
                                </label>
                                <select
                                  value={member.adminRole || "root_admin"}
                                  onChange={(e) =>
                                    handleMemberRoleChange(
                                      member._id,
                                      e.target.value as "root_admin" | "sub_admin"
                                    )
                                  }
                                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-100 focus:outline-none"
                                  style={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
                                >
                                  <option value="root_admin">👑 Root Admin (Full Access)</option>
                                  <option value="sub_admin">🛡️ Sub Admin (Custom Permissions)</option>
                                </select>
                              </div>

                              <button
                                type="button"
                                disabled={savingMemberId === member._id}
                                onClick={() => handleSaveMemberAccess(member)}
                                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5 self-end"
                              >
                                {savingMemberId === member._id && (
                                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                )}
                                Save Access
                              </button>
                            </div>
                          </div>

                          {/* Permissions Checkbox Grid */}
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-wider mb-3" style={{ color: "rgba(148,163,184,0.6)" }}>
                              Modular Access &amp; Feature Permissions
                            </p>

                            {isMemberRoot ? (
                              <div className="p-4 rounded-2xl text-xs font-semibold flex items-center gap-2" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                                <span>👑</span>
                                <span>Root Admins automatically have unrestricted view &amp; edit access across all dashboard features and system settings.</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {PERM_MODULES.map((mod) => {
                                  const isAllowed = memberPerms[mod.key] !== false;
                                  return (
                                    <div
                                      key={mod.key}
                                      onClick={() => handleToggleMemberPerm(member._id, mod.key)}
                                      className="p-3.5 rounded-2xl cursor-pointer transition-all flex items-start gap-3"
                                      style={isAllowed 
                                        ? { background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)" }
                                        : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", opacity: 0.5 }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isAllowed}
                                        onChange={() => {}}
                                        className="mt-0.5 w-4 h-4 text-violet-500 rounded focus:ring-violet-500 cursor-pointer"
                                      />
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-base">{mod.icon}</span>
                                          <p className="text-xs font-bold text-slate-100">{mod.label}</p>
                                        </div>
                                        <p className="text-[10px] font-medium mt-0.5 leading-snug" style={{ color: "rgba(148,163,184,0.5)" }}>
                                          {mod.desc}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
