"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminSpinner from "@/components/admin/AdminSpinner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useCallback, useEffect, useState } from "react";

// --- Types ---

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
type PaymentStatus =
  | "pending_verification"
  | "pending_delivery"
  | "paid"
  | "refunded";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  email?: string;
  phone?: string;
}

interface ExchangeRequest {
  requestedAt: string;
  status: "pending" | "approved" | "rejected" | "completed";
  reason: string;
  items: { name: string; size?: string; color?: string; quantity: number }[];
  adminNote?: string;
}

interface Order {
  _id: string;
  user: { name: string; email: string } | null;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  status: OrderStatus;
  exchangeRequest?: ExchangeRequest;
  paymentMethod?: "bkash" | "nagad" | "rocket" | "cod";
  txnId?: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  shippingAddress: ShippingAddress;
}

const PAYMENT_STATUS_STYLE: Record<
  string,
  { badge: string; dot: string; label: string }
> = {
  pending_verification: {
    badge: "bg-amber-900/20 text-amber-400 ring-1 ring-amber-500/30",
    dot: "bg-amber-400",
    label: "Verifying Payment",
  },
  pending_delivery: {
    badge: "bg-blue-900/20 text-blue-400 ring-1 ring-blue-500/30",
    dot: "bg-blue-400",
    label: "Awaiting Delivery",
  },
  paid: {
    badge: "bg-emerald-900/20 text-emerald-400 ring-1 ring-emerald-500/30",
    dot: "bg-emerald-500",
    label: "Paid",
  },
  refunded: {
    badge: "bg-purple-900/20 text-purple-300 ring-1 ring-purple-500/30",
    dot: "bg-purple-400",
    label: "Payment Returned",
  },
  cancelled: {
    badge: "bg-rose-900/20 text-rose-400 ring-1 ring-rose-500/30",
    dot: "bg-rose-400",
    label: "Cancelled",
  },
  returned: {
    badge: "bg-orange-900/20 text-orange-400 ring-1 ring-orange-500/30",
    dot: "bg-orange-400",
    label: "Returned",
  },
};

const METHOD_LABEL: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  cod: "Cash on Delivery",
};

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Order Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const STATUS_STYLE: Record<OrderStatus, { badge: string; dot: string }> = {
  pending: {
    badge: "bg-amber-900/20 text-amber-400 ring-1 ring-amber-500/30",
    dot: "bg-amber-400",
  },
  confirmed: {
    badge: "bg-violet-900/20 text-violet-300 ring-1 ring-violet-500/30",
    dot: "bg-violet-500",
  },
  shipped: {
    badge: "bg-blue-900/20 text-blue-400 ring-1 ring-blue-500/30",
    dot: "bg-blue-500",
  },
  delivered: {
    badge: "bg-emerald-900/20 text-emerald-400 ring-1 ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  cancelled: {
    badge: "bg-red-900/20 text-red-400 ring-1 ring-red-500/30",
    dot: "bg-red-500",
  },
  returned: {
    badge: "bg-orange-900/20 text-orange-400 ring-1 ring-orange-500/30",
    dot: "bg-orange-500",
  },
};

// --- Toast ---

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
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

// --- Status Dropdown ---

function StatusSelect({
  orderId,
  current,
  onUpdate,
}: {
  orderId: string;
  current: OrderStatus;
  onUpdate: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const style = STATUS_STYLE[current];

  const choose = async (s: OrderStatus) => {
    setOpen(false);
    if (s === current) return;
    setUpdating(true);
    try {
      await onUpdate(orderId, s);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={updating}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${style.badge} ${updating ? "opacity-60" : "hover:opacity-80"}`}
      >
        {updating ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
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
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        )}
        {STATUS_LABEL[current]}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full mt-1.5 left-0 z-20 w-44 rounded-2xl shadow-xl py-1.5 overflow-hidden"
            style={{
              background: "rgba(15,15,25,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            {STATUSES.map((s) => {
              const st = STATUS_STYLE[s];
              return (
                <button
                  key={s}
                  onClick={() => choose(s)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-white/[0.06] ${s === current ? "font-semibold text-slate-100" : "text-slate-400"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`}
                  />
                  {STATUS_LABEL[s]}
                  {s === current && (
                    <svg
                      className="w-3 h-3 ml-auto text-blue-400 shrink-0"
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
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// --- Order Details Modal ---

function OrderDetailsModal({
  order,
  onClose,
  onStatusUpdate,
  onConfirmPayment,
  onExchangeAction,
  onRefundPayment,
}: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (id: string, status: OrderStatus) => Promise<void>;
  onConfirmPayment: (id: string) => Promise<void>;
  onExchangeAction?: (
    id: string,
    status: "approved" | "rejected" | "completed",
    markAsReturned?: boolean,
  ) => Promise<void>;
  onRefundPayment?: (id: string) => Promise<void>;
}) {
  const addr = order.shippingAddress;
  const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
  const [confirmingPay, setConfirmingPay] = useState(false);
  const [refundingPay, setRefundingPay] = useState(false);
  const [actingExchange, setActingExchange] = useState(false);
  const effectivePayStatus =
    order.paymentStatus === "refunded"
      ? "refunded"
      : order.status === "cancelled"
        ? "cancelled"
        : order.status === "returned"
          ? "returned"
          : order.status === "delivered" || order.paymentStatus === "paid"
            ? "paid"
            : (order.paymentStatus ?? "pending_verification");
  const payCfg =
    PAYMENT_STATUS_STYLE[effectivePayStatus] ??
    PAYMENT_STATUS_STYLE["pending_verification"];

  const handleConfirmPayment = async () => {
    setConfirmingPay(true);
    try {
      await onConfirmPayment(order._id);
    } finally {
      setConfirmingPay(false);
    }
  };

  const handleRefund = async () => {
    if (
      !confirm(
        "Are you sure you want to mark this payment as Refunded to the customer?",
      )
    )
      return;
    setRefundingPay(true);
    try {
      await onRefundPayment?.(order._id);
    } finally {
      setRefundingPay(false);
    }
  };

  const handleExchange = async (
    status: "approved" | "rejected" | "completed",
    markAsReturned?: boolean,
  ) => {
    setActingExchange(true);
    try {
      await onExchangeAction?.(order._id, status, markAsReturned);
    } finally {
      setActingExchange(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        style={{
          background: "rgba(15,15,25,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(124,58,237,0.06)",
          }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#e2e8f0" }}>
              Order Details
            </h2>
            <p
              className="text-xs font-mono mt-0.5"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              #{order._id.slice(-12).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(148,163,184,0.8)",
            }}
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

        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
          {/* Status + Date */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                Placed on
              </p>
              <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <StatusSelect
              orderId={order._id}
              current={order.status}
              onUpdate={onStatusUpdate}
            />
          </div>

          {/* Exchange Request Banner */}
          {order.exchangeRequest && (
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{
                background: "rgba(251,146,60,0.08)",
                border: "1px solid rgba(251,146,60,0.2)",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#fb923c" }}
                >
                  <svg
                    className="w-4 h-4 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  Exchange / Return Request ({order.exchangeRequest.status})
                </div>
                <span className="text-[11px] font-mono text-orange-400">
                  {new Date(
                    order.exchangeRequest.requestedAt,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs text-orange-300">
                <span className="font-semibold">Reason:</span>{" "}
                {order.exchangeRequest.reason}
              </p>
              {order.exchangeRequest.status === "pending" && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    disabled={actingExchange}
                    onClick={() => handleExchange("approved")}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                  >
                    Approve Exchange
                  </button>
                  <button
                    disabled={actingExchange}
                    onClick={() => handleExchange("completed", true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                  >
                    Mark as Returned
                  </button>
                  <button
                    disabled={actingExchange}
                    onClick={() => handleExchange("rejected")}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment / Order Status Banner */}
          {order.paymentStatus === "refunded" ? (
            <div
              className="rounded-2xl p-4 flex items-center justify-between gap-3"
              style={{
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.25)",
              }}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-purple-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                  />
                </svg>
                <p className="text-sm font-bold text-purple-300">
                  Payment Returned (
                  {order.paymentMethod && order.paymentMethod !== "cod"
                    ? `Returned via ${METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}`
                    : "Payment Returned"}
                  )
                </p>
              </div>
              {order.txnId && (
                <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  TxnID: {order.txnId}
                </span>
              )}
            </div>
          ) : order.status === "cancelled" ? (
            <div
              className="rounded-2xl p-4 flex items-center justify-between gap-3"
              style={{
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.25)",
              }}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-rose-400 shrink-0"
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
                <p className="text-sm font-semibold text-rose-400">
                  Order Cancelled
                </p>
              </div>
              {order.paymentStatus === "paid" && (
                <button
                  disabled={refundingPay}
                  onClick={handleRefund}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold transition-colors border border-purple-500/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                    />
                  </svg>
                  {refundingPay ? "Refunding..." : "Refund Payment"}
                </button>
              )}
            </div>
          ) : order.status === "returned" ? (
            <div
              className="rounded-2xl p-4 flex items-center justify-between gap-3"
              style={{
                background: "rgba(251,146,60,0.08)",
                border: "1px solid rgba(251,146,60,0.25)",
              }}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-orange-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 15v-1a4 4 0 00-4-4H4m0 0l4-4m-4 4l4 4"
                  />
                </svg>
                <p className="text-sm font-semibold text-orange-400">
                  Order Returned
                </p>
              </div>
              {order.paymentStatus === "paid" && (
                <button
                  disabled={refundingPay}
                  onClick={handleRefund}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold transition-colors border border-purple-500/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                    />
                  </svg>
                  {refundingPay ? "Refunding..." : "Refund Payment"}
                </button>
              )}
            </div>
          ) : order.status === "delivered" ||
            order.paymentStatus === "paid" ||
            order.paymentMethod !== "cod" ? (
            <div
              className="rounded-2xl p-4 flex items-center justify-between gap-3"
              style={{
                background: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-emerald-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-bold text-emerald-400">
                  Payment Confirmed (
                  {order.paymentMethod && order.paymentMethod !== "cod"
                    ? `Paid via ${METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}`
                    : "Paid"}
                  )
                </p>
              </div>
              <div className="flex items-center gap-2">
                {order.txnId && (
                  <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    TxnID: {order.txnId}
                  </span>
                )}
                {order.paymentStatus === "paid" && (
                  <button
                    disabled={refundingPay}
                    onClick={handleRefund}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold transition-colors border border-purple-500/30 flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                      />
                    </svg>
                    {refundingPay ? "Refunding..." : "Refund"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: "rgba(96,165,250,0.08)",
                border: "1px solid rgba(96,165,250,0.2)",
              }}
            >
              <svg
                className="w-5 h-5 text-blue-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-semibold text-blue-400">
                Awaiting Delivery / Payment
              </p>
            </div>
          )}

          {/* Customer + Shipping */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                Customer
              </p>
              {order.user ? (
                <>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#e2e8f0" }}
                  >
                    {order.user.name}
                  </p>
                  <p className="text-xs mt-0.5 text-slate-400">
                    {order.user.email}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-500 italic">Deleted user</p>
              )}
              {addr.email && (
                <p className="text-xs text-slate-400 mt-0.5">{addr.email}</p>
              )}
              {addr.phone && (
                <p className="text-xs text-slate-400 mt-0.5">{addr.phone}</p>
              )}
            </div>
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                Ship To
              </p>
              {fullName && (
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#e2e8f0" }}
                >
                  {fullName}
                </p>
              )}
              {addr.address && (
                <p className="text-xs text-slate-400 mt-0.5">{addr.address}</p>
              )}
              <p className="text-xs text-slate-400">
                {[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}
              </p>
              {addr.country && (
                <p className="text-xs text-slate-400">{addr.country}</p>
              )}
            </div>
          </div>

          {/* Payment method + TxnID + Refund Action */}
          {order.paymentMethod && (
            <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
              <div className="flex items-center gap-3">
                {order.paymentStatus === "refunded" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Payment Returned
                  </span>
                ) : order.paymentStatus === "paid" ||
                  order.paymentMethod !== "cod" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Paid
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${payCfg.badge}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${payCfg.dot}`}
                    />
                    {payCfg.label}
                  </span>
                )}
                <span className="font-semibold text-slate-200">
                  {METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
                </span>
                {order.txnId && (
                  <span className="font-mono text-xs font-bold text-slate-200 bg-white/[0.08] px-2.5 py-1 rounded-lg border border-white/10">
                    TxnID: {order.txnId}
                  </span>
                )}
              </div>

              {order.paymentStatus === "paid" && (
                <button
                  disabled={refundingPay}
                  onClick={handleRefund}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold transition-colors border border-purple-500/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                    />
                  </svg>
                  {refundingPay ? "Refunding..." : "Refund Payment"}
                </button>
              )}
            </div>
          )}

          {/* Items */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              Items ({order.items.length})
            </p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "#e2e8f0" }}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {[
                        item.size && `Size: ${item.size}`,
                        item.color && `Color: ${item.color}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-200">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.quantity} × ৳{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div
            className="pt-4 space-y-1.5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {order.subtotal !== undefined && (
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="font-medium text-slate-200">
                  ৳{order.subtotal.toFixed(2)}
                </span>
              </div>
            )}
            {order.shippingCost !== undefined && (
              <div className="flex justify-between text-sm text-slate-400">
                <span>Shipping</span>
                <span className="font-medium text-slate-200">
                  {order.shippingCost === 0
                    ? "Free"
                    : `৳${order.shippingCost.toFixed(2)}`}
                </span>
              </div>
            )}
            {order.discount !== undefined && order.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400 font-medium">
                <span>Discount (Promo)</span>
                <span>−৳{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div
              className="flex justify-between text-base font-bold text-slate-100 pt-2 mt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span>Total</span>
              <span>৳{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Page ---

function OrdersContent() {
  const { apiFetch } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await apiFetch<{
        success: boolean;
        data: Order[];
        pagination: { total: number; pages: number };
      }>(`/admin/orders?${params}`);
      setOrders(res.data);
      setPagination({
        total: res.pagination.total,
        pages: res.pagination.pages,
      });
    } catch (e: unknown) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to load orders",
      );
    } finally {
      setLoading(false);
    }
  }, [apiFetch, page, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (id: string, status: OrderStatus) => {
    try {
      await apiFetch(`/admin/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      showToast("success", `Status updated to "${status}"`);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o)),
      );
      if (selectedOrder?._id === id) {
        setSelectedOrder((o) => (o ? { ...o, status } : o));
      }
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Update failed");
      throw e;
    }
  };

  const handleConfirmPayment = async (id: string) => {
    try {
      await apiFetch(`/admin/orders/${id}/confirm-payment`, { method: "PUT" });
      showToast("success", "Payment confirmed successfully");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? {
                ...o,
                paymentStatus: "paid",
                status: o.status === "pending" ? "confirmed" : o.status,
              }
            : o,
        ),
      );
      if (selectedOrder?._id === id) {
        setSelectedOrder((o) =>
          o
            ? {
                ...o,
                paymentStatus: "paid",
                status: o.status === "pending" ? "confirmed" : o.status,
              }
            : o,
        );
      }
    } catch (e: unknown) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to confirm payment",
      );
      throw e;
    }
  };

  const handleRefundPayment = async (id: string) => {
    try {
      await apiFetch(`/admin/orders/${id}/refund-payment`, { method: "PUT" });
      showToast("success", "Payment marked as Refunded");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, paymentStatus: "refunded" } : o,
        ),
      );
      if (selectedOrder?._id === id) {
        setSelectedOrder((o) => (o ? { ...o, paymentStatus: "refunded" } : o));
      }
    } catch (e: unknown) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to refund payment",
      );
      throw e;
    }
  };

  const handleExchangeAction = async (
    id: string,
    status: "approved" | "rejected" | "completed",
    markAsReturned?: boolean,
  ) => {
    try {
      await apiFetch(`/admin/orders/${id}/exchange`, {
        method: "PUT",
        body: JSON.stringify({ status, markAsReturned }),
      });
      showToast("success", `Exchange request ${status}`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? {
                ...o,
                status: markAsReturned ? "returned" : o.status,
                exchangeRequest: o.exchangeRequest
                  ? { ...o.exchangeRequest, status }
                  : undefined,
              }
            : o,
        ),
      );
      if (selectedOrder?._id === id) {
        setSelectedOrder((o) =>
          o
            ? {
                ...o,
                status: markAsReturned ? "returned" : o.status,
                exchangeRequest: o.exchangeRequest
                  ? { ...o.exchangeRequest, status }
                  : undefined,
              }
            : o,
        );
      }
    } catch (e: unknown) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to update exchange request",
      );
    }
  };

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div>
        <p className="text-sm text-slate-400 font-medium">
          {pagination.total} total order{pagination.total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => {
              setStatusFilter("all");
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0"
            style={
              statusFilter === "all"
                ? {
                    background: "linear-gradient(135deg, #5b21b6, #4338ca)",
                    color: "#fff",
                  }
                : {
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(148,163,184,0.7)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }
            }
          >
            All
            <span className="ml-2 text-xs opacity-60">{pagination.total}</span>
          </button>
          {STATUSES.map((s) => {
            const st = STATUS_STYLE[s];
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all shrink-0"
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, #5b21b6, #4338ca)",
                        color: "#fff",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(148,163,184,0.7)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${active ? "bg-white/60" : st.dot}`}
                />
                {s}
              </button>
            );
          })}
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 lg:ml-auto flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">
              From:
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm rounded-xl focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">
              To:
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm rounded-xl focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={clearDateFilter}
              className="px-3 py-2 text-xs font-bold text-slate-400 bg-white/[0.06] rounded-xl hover:bg-white/[0.1] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-x-auto"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {loading ? (
          <AdminSpinner label="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <svg
              className="w-12 h-12 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
            <p className="text-sm font-medium">
              No orders{" "}
              {statusFilter !== "all" ? `with status "${statusFilter}"` : "yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {[
                    "Order",
                    "Customer",
                    "Items",
                    "Destination",
                    "Total",
                    "Payment",
                    "Status",
                    "Date",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] font-bold uppercase tracking-[0.08em] px-4 py-3.5 whitespace-nowrap text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-violet-900/10 transition-colors duration-100 group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {order.user ? (
                        <div className="min-w-0 max-w-[160px]">
                          <p className="text-sm font-semibold text-slate-100 truncate">
                            {order.user.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {order.user.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic">
                          Deleted user
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="min-w-0 max-w-[220px] space-y-1">
                        {order.items.slice(0, 2).map((item, i) => (
                          <p
                            key={i}
                            className="text-xs text-slate-300 line-clamp-1 leading-snug"
                            title={`${item.quantity}× ${item.name}`}
                          >
                            <span className="font-bold text-slate-100">{item.quantity}×</span>{" "}
                            {item.name}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-slate-500 font-medium">
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-medium max-w-[180px]">
                      {(() => {
                        const addr = order.shippingAddress;
                        if (!addr)
                          return (
                            <span className="text-slate-500 italic">
                              No address
                            </span>
                          );
                        const addressLine = addr.address
                          ? addr.address.trim()
                          : "";
                        const locParts = [addr.city, addr.state]
                          .filter(Boolean)
                          .join(", ");
                        return (
                          <div className="space-y-0.5 leading-snug">
                            {addressLine ? (
                              <p
                                className="font-semibold text-slate-200 line-clamp-1"
                                title={addressLine}
                              >
                                {addressLine}
                              </p>
                            ) : (
                              <p className="font-semibold text-slate-200">
                                {locParts || "Dhaka, Bangladesh"}
                              </p>
                            )}
                            {addressLine && locParts && (
                              <p
                                className="text-[11px] text-slate-500 truncate"
                                title={locParts}
                              >
                                {locParts}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-black text-slate-100">
                        ৳{order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {(() => {
                        const statusKey =
                          order.paymentStatus === "refunded"
                            ? "refunded"
                            : order.status === "cancelled"
                              ? "cancelled"
                              : order.status === "returned"
                                ? "returned"
                                : order.status === "delivered" ||
                                    order.paymentStatus === "paid"
                                  ? "paid"
                                  : (order.paymentStatus ??
                                    "pending_verification");
                        const ps =
                          PAYMENT_STATUS_STYLE[statusKey] ??
                          PAYMENT_STATUS_STYLE["pending_verification"];
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${ps.badge}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${ps.dot}`}
                            />
                            {ps.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td
                      className="px-4 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StatusSelect
                        orderId={order._id}
                        current={order.status}
                        onUpdate={handleStatusUpdate}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-300 font-medium whitespace-nowrap min-w-[100px]">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        aria-label={`View details for order #${order._id.slice(-8).toUpperCase()}`}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] hover:text-white border border-white/10 rounded-xl transition-all shadow-sm flex items-center gap-1"
                      >
                        Details
                      </button>
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
            <p className="text-xs font-medium text-slate-400">
              Showing page <span className="font-bold text-white">{page}</span>{" "}
              of{" "}
              <span className="font-bold text-white">{pagination.pages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(226,232,240,0.8)",
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="px-4 py-2 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(226,232,240,0.8)",
                }}
              >
                Next
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
          onConfirmPayment={handleConfirmPayment}
          onExchangeAction={handleExchangeAction}
          onRefundPayment={handleRefundPayment}
        />
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AdminAuthGuard>
      <OrdersContent />
    </AdminAuthGuard>
  );
}
