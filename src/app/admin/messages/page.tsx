"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useCallback, useEffect, useState } from "react";

interface ContactMessage {
  _id: string;
  topic: "general" | "order" | "returns" | "sizing" | "press";
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TOPIC_LABEL: Record<ContactMessage["topic"], string> = {
  general: "General",
  order: "Order Support",
  returns: "Returns",
  sizing: "Sizing",
  press: "Press / Collab",
};

export default function AdminMessagesPage() {
  return (
    <AdminAuthGuard>
      <MessagesContent />
    </AdminAuthGuard>
  );
}

function MessagesContent() {
  const { apiFetch } = useAdminAuth();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: ContactMessage[];
        meta?: { unreadCount?: number };
      }>("/admin/messages?limit=100");
      setMessages(res.data ?? []);
      setUnreadCount(res.meta?.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markRead = async (id: string) => {
    await apiFetch(`/admin/messages/${id}/read`, { method: "PUT" });
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, isRead: true } : m)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setSelected((prev) =>
      prev && prev._id === id ? { ...prev, isRead: true } : prev,
    );
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Contact Messages
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "rgba(148,163,184,0.6)" }}
          >
            Messages sent from the website contact form.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: "rgba(167,139,250,0.12)",
            color: "#a78bfa",
            border: "1px solid rgba(167,139,250,0.2)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          Unread: {unreadCount}
        </span>
      </div>

      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                borderTopColor: "#7c3aed",
              }}
            />
          </div>
        ) : messages.length === 0 ? (
          <div
            className="p-12 text-center text-sm"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            No messages yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <th
                    className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    Topic
                  </th>
                  <th
                    className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    From
                  </th>
                  <th
                    className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    Subject
                  </th>
                  <th
                    className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    Date
                  </th>
                  <th
                    className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg._id}
                    className="hover:bg-violet-900/10 transition-colors duration-100"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.035)",
                      background: msg.isRead
                        ? "transparent"
                        : "rgba(124,58,237,0.06)",
                    }}
                  >
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          msg.isRead
                            ? {
                                background: "rgba(255,255,255,0.06)",
                                color: "rgba(148,163,184,0.7)",
                              }
                            : {
                                background: "rgba(167,139,250,0.15)",
                                color: "#a78bfa",
                                border: "1px solid rgba(167,139,250,0.2)",
                              }
                        }
                      >
                        {msg.isRead ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-300">
                      {TOPIC_LABEL[msg.topic]}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-100">{msg.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {msg.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      {msg.subject}
                    </td>
                    <td
                      className="px-6 py-4 text-xs font-medium whitespace-nowrap"
                      style={{ color: "rgba(148,163,184,0.5)" }}
                    >
                      {new Date(msg.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(msg)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(226,232,240,0.8)",
                          }}
                        >
                          View
                        </button>
                        {!msg.isRead && (
                          <button
                            onClick={() => markRead(msg._id)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
                          >
                            Mark Read
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
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 p-4 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "rgba(15,15,25,0.98)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="px-6 py-5 flex items-center justify-between"
              style={{
                background: "rgba(124,58,237,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h2 className="text-lg font-bold text-slate-100">
                Message Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(148,163,184,0.8)",
                }}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  From
                </p>
                <p className="font-bold text-slate-100">
                  {selected.name}{" "}
                  <span className="text-slate-400 font-normal">
                    ({selected.email})
                  </span>
                </p>
              </div>
              <div>
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  Topic
                </p>
                <p className="font-semibold text-violet-400">
                  {TOPIC_LABEL[selected.topic]}
                </p>
              </div>
              <div>
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  Subject
                </p>
                <p className="font-bold text-slate-100">{selected.subject}</p>
              </div>
              <div>
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  Message
                </p>
                <div
                  className="p-4 rounded-2xl leading-relaxed text-slate-300"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {selected.message}
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                {!selected.isRead && (
                  <button
                    onClick={() => markRead(selected._id)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="px-5 py-2.5 rounded-2xl font-semibold text-sm transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(226,232,240,0.8)",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
