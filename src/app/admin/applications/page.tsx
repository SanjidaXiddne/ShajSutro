"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useCallback, useEffect, useMemo, useState } from "react";

type Application = {
  _id: string;
  job: {
    _id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    level: string;
    isActive: boolean;
  };
  name: string;
  email: string;
  phone: string;
  cvUrl: string;
  note?: string;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ApplicationsContent() {
  const { apiFetch } = useAdminAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; data: Application[] }>(
        "/job-applications/all",
      );
      setApps(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) => {
      const hay = `${a.name} ${a.email} ${a.phone} ${a.job?.title ?? ""} ${a.job?.department ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [apps, query]);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Job Applications
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>
            {apps.length} total submission{apps.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-72">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, job…"
              className="w-full px-4 py-3 rounded-2xl text-sm transition-all focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f1f5f9" }}
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "rgba(148,163,184,0.5)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M21 21l-4.35-4.35m1.6-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={fetchAll}
            className="px-5 py-3 rounded-2xl text-sm font-bold text-white transition-all flex items-center gap-2"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115.357-2m1.643 9a9 9 0 01-15.357 2" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.08)", borderTopColor: "#7c3aed" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl p-12 text-center" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.5)" }}>
          No applications found.
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="overflow-auto">
            <table className="min-w-[980px] w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                  <th className="text-left text-[11px] font-bold uppercase tracking-[0.08em] px-6 py-4" style={{ color: "rgba(148,163,184,0.5)" }}>Candidate</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-[0.08em] px-6 py-4" style={{ color: "rgba(148,163,184,0.5)" }}>Job</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-[0.08em] px-6 py-4" style={{ color: "rgba(148,163,184,0.5)" }}>Contact</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-[0.08em] px-6 py-4" style={{ color: "rgba(148,163,184,0.5)" }}>CV</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-[0.08em] px-6 py-4" style={{ color: "rgba(148,163,184,0.5)" }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a._id}
                    className="hover:bg-violet-900/10 transition-colors duration-100"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.035)" }}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold" style={{ color: "#e2e8f0" }}>{a.name}</p>
                      {a.note?.trim() && (
                        <p className="text-xs mt-1 line-clamp-2 max-w-sm" style={{ color: "rgba(148,163,184,0.5)" }}>
                          {a.note}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                        {a.job?.title ?? "—"}
                      </p>
                      <p className="text-xs mt-1 font-medium" style={{ color: "rgba(148,163,184,0.6)" }}>
                        {a.job?.department ?? ""}{a.job ? " · " : ""}{a.job?.location ?? ""}{a.job ? " · " : ""}{a.job?.type ?? ""} · {a.job?.level ?? ""}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>
                        <span className="font-semibold" style={{ color: "rgba(148,163,184,0.5)" }}>Email:</span> {a.email}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>
                        <span className="font-semibold" style={{ color: "rgba(148,163,184,0.5)" }}>Phone:</span> {a.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={a.cvUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                        style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}
                        rel="noreferrer"
                      >
                        Download
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16.5V3m0 13.5l-3.75-3.75M12 16.5l3.75-3.75M3.75 20.25h16.5" />
                        </svg>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.5)" }}>{formatDate(a.createdAt)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <AdminAuthGuard>
      <ApplicationsContent />
    </AdminAuthGuard>
  );
}
