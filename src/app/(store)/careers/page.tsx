"use client";

import { getApiBase } from "@/lib/apiBase";
import { notifyError, notifySuccess } from "@/lib/notify";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Job = {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  level: "Junior" | "Mid" | "Senior" | "Lead";
  description?: string;
  deadline?: string | null;
  bullets: string[];
};

type ApplyForm = {
  name: string;
  email: string;
  phone: string;
  note: string;
  cv: File | null;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-charcoal-200 bg-white/70 px-3 py-1 text-[11px] font-medium text-charcoal-600">
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-charcoal-100 bg-white p-5 shadow-soft">
      <div className="w-10 h-10 rounded-xl bg-charcoal-50 border border-charcoal-100 grid place-items-center text-charcoal-700">
        {icon}
      </div>
      <p className="mt-4 text-xl font-semibold text-charcoal-950 tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-charcoal-400 font-light">{label}</p>
    </div>
  );
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dept, setDept] = useState("All");
  const [query, setQuery] = useState("");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ApplyForm>({
    name: "",
    email: "",
    phone: "",
    note: "",
    cv: null,
  });

  useEffect(() => {
    fetch(`${getApiBase()}/api/jobs`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setJobs(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("applied_jobs");
      if (!raw) return;
      const ids = JSON.parse(raw) as string[];
      setAppliedIds(new Set(ids));
    } catch {
      /* ignore */
    }
  }, []);

  const persistApplied = (next: Set<string>) => {
    setAppliedIds(new Set(next));
    localStorage.setItem("applied_jobs", JSON.stringify(Array.from(next)));
  };

  const departments = useMemo(() => {
    const depts = Array.from(new Set(jobs.map((j) => j.department))).sort();
    return ["All", ...depts];
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      const deptOk = dept === "All" || j.department === dept;
      const qOk =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q);
      return deptOk && qOk;
    });
  }, [jobs, dept, query]);

  const applyEmail = "careers@shajsutro.com";

  const openApply = (job: Job) => {
    setApplyJob(job);
    setForm({ name: "", email: "", phone: "", note: "", cv: null });
  };

  const closeApply = () => {
    if (submitting) return;
    setApplyJob(null);
  };

  const submitApply = async () => {
    if (!applyJob) return;
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      notifyError("Please fill name, email, and phone.");
      return;
    }
    if (!isValidEmail(form.email.trim())) {
      notifyError("Please enter a valid email.");
      return;
    }
    if (!form.cv) {
      notifyError("Please upload your CV (PDF/DOC/DOCX).");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("jobId", applyJob._id);
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("phone", form.phone.trim());
      if (form.note.trim()) fd.append("note", form.note.trim());
      fd.append("cv", form.cv);

      const res = await fetch(`${getApiBase()}/api/job-applications`, {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Failed to submit application");
      }

      const next = new Set(appliedIds);
      next.add(applyJob._id);
      persistApplied(next);
      notifySuccess("Application submitted successfully!");
      setApplyJob(null);
    } catch (e: unknown) {
      notifyError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-warm-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="absolute top-10 -right-24 h-96 w-96 rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/20 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-14 sm:pt-16 pb-10">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-charcoal-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-charcoal-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {loading
                  ? "We’re hiring"
                  : jobs.length > 0
                    ? `${jobs.length} open role${jobs.length !== 1 ? "s" : ""}`
                    : "We’re always hiring"}
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-charcoal-950">
                Build the future of everyday style.
              </h1>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-charcoal-500 font-light max-w-2xl">
                At ShajSutro we craft thoughtful essentials and build a shopping
                experience that feels effortless. Join a small team with high
                standards, fast iteration, and real ownership.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a
                  href="#open-roles"
                  className="btn-primary inline-flex items-center justify-center px-6 py-3.5"
                >
                  View open roles
                </a>
                <a
                  href={`mailto:${applyEmail}?subject=${encodeURIComponent("Career at ShajSutro")}`}
                  className="btn-secondary inline-flex items-center justify-center px-6 py-3.5"
                >
                  Send resume
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                <Badge>Remote friendly</Badge>
                <Badge>Learning budget</Badge>
                <Badge>Fast growth</Badge>
                <Badge>Culture of craft</Badge>
              </div>
            </div>

            <div className="w-full lg:w-[420px]">
              <div className="rounded-3xl border border-charcoal-100 bg-white shadow-soft overflow-hidden">
                <div className="p-6 border-b border-charcoal-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
                    Why ShajSutro
                  </p>
                  <p className="mt-2 text-sm text-charcoal-700 font-medium">
                    A calm, high-ownership team.
                  </p>
                  <p className="mt-1.5 text-xs text-charcoal-400 font-light leading-relaxed">
                    We value clarity, good taste, and building things that last.
                  </p>
                </div>
                <div className="p-6 grid gap-3">
                  {[
                    {
                      title: "Ownership",
                      desc: "Small team, big impact. Ship end-to-end.",
                    },
                    {
                      title: "Craft",
                      desc: "Design and engineering work together closely.",
                    },
                    {
                      title: "Momentum",
                      desc: "Iterate weekly with customer feedback.",
                    },
                  ].map((x) => (
                    <div
                      key={x.title}
                      className="rounded-2xl border border-charcoal-100 bg-white px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-charcoal-950">
                        {x.title}
                      </p>
                      <p className="mt-1 text-xs text-charcoal-400 font-light leading-relaxed">
                        {x.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-[11px] text-charcoal-400 font-light">
                Prefer to apply later? Save this page or email us at{" "}
                <a
                  className="font-medium text-charcoal-700 hover:text-charcoal-950 transition-colors"
                  href={`mailto:${applyEmail}`}
                >
                  {applyEmail}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Team size"
            value="10–20"
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
                  strokeWidth={1.6}
                  d="M17 20.25v-1.5a3.75 3.75 0 00-3.75-3.75h-2.5A3.75 3.75 0 007 18.75v1.5M12 12a3.75 3.75 0 100-7.5A3.75 3.75 0 0012 12z"
                />
              </svg>
            }
          />
          <Stat
            label="Work style"
            value="Remote-first"
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
                  strokeWidth={1.6}
                  d="M8 7V6a4 4 0 018 0v1M6 7h12v14H6V7z"
                />
              </svg>
            }
          />
          <Stat
            label="Hiring process"
            value="2–3 weeks"
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
                  strokeWidth={1.6}
                  d="M12 6v6l4 2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <Stat
            label="Benefits"
            value="Top-tier"
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
                  strokeWidth={1.6}
                  d="M9 12.75L11.25 15 15 9.75"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* Open Roles */}
      <section
        id="open-roles"
        className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pb-16"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
              Open roles
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal-950">
              Find your next chapter.
            </h2>
            <p className="mt-2 text-sm text-charcoal-500 font-light max-w-2xl">
              Don’t see your role? Send your resume anyway — we love meeting
              talented people.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-56">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles…"
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-200 bg-white text-sm text-charcoal-900 placeholder-charcoal-300 focus:outline-none focus:ring-2 focus:ring-charcoal-200 focus:border-charcoal-400 transition-all"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M21 21l-4.35-4.35m1.6-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-charcoal-200 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-200 focus:border-charcoal-400 transition-all"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-5">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-charcoal-100 bg-white h-52 animate-pulse"
                />
              ))
            : filtered.map((j) => (
                <div
                  key={j._id}
                  className="group rounded-3xl border border-charcoal-100 bg-white shadow-soft hover:shadow-[0_18px_60px_rgba(15,23,42,0.10)] transition-shadow overflow-hidden"
                >
                  <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-400">
                          {j.department}
                        </p>
                        <h3 className="mt-2 text-lg sm:text-xl font-semibold text-charcoal-950 tracking-tight">
                          {j.title}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-charcoal-50 border border-charcoal-100 text-charcoal-600 shrink-0">
                        {j.level}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge>{j.location}</Badge>
                      <Badge>{j.type}</Badge>
                      {!!j.deadline && (() => {
                        const passed = new Date() > new Date(j.deadline);
                        return (
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${
                            passed
                              ? "border-red-200 bg-red-50 text-red-800"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}>
                            Deadline:{" "}
                            {new Date(j.deadline).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                            {passed && " (Passed)"}
                          </span>
                        );
                      })()}
                    </div>

                    {j.bullets.length > 0 && (
                      <ul className="mt-5 space-y-2 text-sm text-charcoal-500 font-light">
                        {j.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {j.description?.trim() && (
                      <details className="mt-5 rounded-2xl border border-charcoal-100 bg-charcoal-50/50 px-4 py-3">
                        <summary className="cursor-pointer list-none select-none flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-charcoal-900">
                            Job description
                          </span>
                          <span className="text-xs font-semibold text-emerald-700">
                            View
                          </span>
                        </summary>
                        <div className="mt-3 text-sm text-charcoal-500 font-light leading-relaxed whitespace-pre-wrap">
                          {j.description}
                        </div>
                      </details>
                    )}
                  </div>

                  <div className="px-6 sm:px-7 py-5 border-t border-charcoal-100 bg-gradient-to-r from-emerald-50/60 via-white to-amber-50/50 flex items-center justify-between">
                    <p className="text-[11px] text-charcoal-400 font-light">
                      Apply by email with your CV + portfolio (if any)
                    </p>
                    <button
                      type="button"
                      onClick={() => openApply(j)}
                      disabled={appliedIds.has(j._id) || (!!j.deadline && new Date() > new Date(j.deadline))}
                      className={`text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                        appliedIds.has(j._id) || (!!j.deadline && new Date() > new Date(j.deadline))
                          ? "text-charcoal-300 cursor-not-allowed"
                          : "text-charcoal-950 hover:text-emerald-700"
                      }`}
                    >
                      {appliedIds.has(j._id) 
                        ? "Applied" 
                        : (!!j.deadline && new Date() > new Date(j.deadline))
                        ? "Closed"
                        : "Apply"}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.6}
                          d="M7 17L17 7M17 7H9m8 0v8"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

          {!loading && filtered.length === 0 && (
            <div className="rounded-3xl border border-charcoal-100 bg-white p-10 text-center text-sm text-charcoal-500 font-light">
              No roles match your search. Try a different keyword or department.
            </div>
          )}
        </div>
      </section>

      {/* Process + CTA */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-charcoal-100 bg-white shadow-soft p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
              Hiring process
            </p>
            <h3 className="mt-2 text-xl font-semibold text-charcoal-950 tracking-tight">
              Clear, respectful, fast.
            </h3>
            <div className="mt-6 space-y-4">
              {[
                { t: "Intro call", d: "A short chat to align expectations." },
                {
                  t: "Skill interview",
                  d: "Practical discussion — no trick questions.",
                },
                { t: "Team fit", d: "Meet the people you’ll work with." },
                { t: "Offer", d: "Quick decision and transparent feedback." },
              ].map((x, i) => (
                <div key={x.t} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-charcoal-950 text-white grid place-items-center text-sm font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal-950">
                      {x.t}
                    </p>
                    <p className="mt-1 text-xs text-charcoal-400 font-light leading-relaxed">
                      {x.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-charcoal-100 bg-charcoal-950 shadow-soft p-7 sm:p-8 text-white overflow-hidden relative">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Don’t see your role?
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                Send a general application.
              </h3>
              <p className="mt-3 text-sm text-white/70 font-light leading-relaxed max-w-lg">
                If you think you can help ShajSutro grow, we want to hear from
                you. Share your resume and a short note about what you’d like to
                work on.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  className="inline-flex items-center justify-center rounded-2xl bg-white text-charcoal-950 px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                  href={`mailto:${applyEmail}?subject=${encodeURIComponent(
                    "General application",
                  )}`}
                >
                  Email careers
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Contact us
                </Link>
              </div>

              <p className="mt-4 text-[11px] text-white/55 font-light">
                Equal opportunity employer — we welcome everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      {applyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-charcoal-100 overflow-hidden">
            <div className="px-7 py-5 border-b border-charcoal-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
                  Apply
                </p>
                <h3 className="mt-1 text-lg font-semibold text-charcoal-950 tracking-tight">
                  {applyJob.title}
                </h3>
                <p className="mt-1 text-xs text-charcoal-400 font-light">
                  {applyJob.department} · {applyJob.location} · {applyJob.type}
                </p>
              </div>
              <button
                type="button"
                onClick={closeApply}
                disabled={submitting}
                className="w-9 h-9 rounded-2xl border border-charcoal-200 bg-white text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-50 transition-colors grid place-items-center disabled:opacity-60"
                aria-label="Close"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-7 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-600 mb-2">
                    Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-600 mb-2">
                    Phone *
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="input-field"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-600 mb-2">
                  Email *
                </label>
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className="input-field"
                  placeholder="you@example.com"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-600 mb-2">
                  CV / Resume (PDF, DOC, DOCX) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cv: e.target.files?.[0] ?? null }))
                  }
                  className="block w-full text-sm text-charcoal-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-charcoal-950 file:text-white hover:file:bg-charcoal-800"
                />
                <p className="mt-1.5 text-[11px] text-charcoal-400 font-light">
                  Max 8MB. Your file will be visible to admin only.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-600 mb-2">
                  Note (optional)
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, note: e.target.value }))
                  }
                  className="input-field min-h-[110px] resize-y leading-relaxed"
                  placeholder="Anything you want to add…"
                />
              </div>
            </div>

            <div className="px-7 py-5 border-t border-charcoal-100 flex gap-3">
              <button
                type="button"
                onClick={closeApply}
                disabled={submitting}
                className="btn-secondary flex-1 py-3.5 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitApply}
                disabled={submitting || (!!applyJob.deadline && new Date() > new Date(applyJob.deadline))}
                className="btn-primary flex-1 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting 
                  ? "Submitting…" 
                  : (!!applyJob.deadline && new Date() > new Date(applyJob.deadline))
                  ? "Deadline Passed"
                  : "Submit application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
