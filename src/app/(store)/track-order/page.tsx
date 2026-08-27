"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getApiBase } from "@/lib/apiBase";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
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
  email?: string;
  phone?: string;
}

interface StatusHistoryItem {
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";
  updatedAt: string;
  note?: string;
}

interface OrderData {
  _id: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";
  paymentMethod?: "bkash" | "nagad" | "rocket" | "cod";
  paymentStatus: "pending_verification" | "pending_delivery" | "paid";
  txnId?: string;
  createdAt: string;
  shippingAddress: ShippingAddress;
  statusHistory?: StatusHistoryItem[];
}

const STEPS = [
  { key: "pending", title: "Order Placed", desc: "Received & awaiting verification" },
  { key: "confirmed", title: "Confirmed", desc: "Payment verified & packing items" },
  { key: "shipped", title: "Shipped", desc: "In transit with courier" },
  { key: "delivered", title: "Delivered", desc: "Package handed to customer" },
] as const;

function getStepIndex(status: string): number {
  switch (status) {
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
    case "returned":
      return -1;
    default:
      return 0;
  }
}

function formatDate(isoString: string) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("id") || searchParams.get("order") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleTrack = useCallback(async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) {
      setError("Please enter an Order ID, Phone Number, or Transaction ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(`${getApiBase()}/api/orders/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No order found matching your search.");
      }

      setOrder(data.data);
    } catch (err: any) {
      setError(err.message || "Unable to track order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleTrack(initialQuery);
    }
  }, [initialQuery, handleTrack]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack(query);
  };

  const currentStep = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === "cancelled" || order?.status === "returned";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Header Section */}
      <div className="bg-warm-50 border-b border-slate-200 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          {/* <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider">
            📦 Real-Time Order Tracking
          </span> */}
          <h1 className="text-3xl sm:text-5xl font-semibold text-slate-950 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
            Enter your Order ID, or Phone Number below to check live shipment status.
          </p>

          {/* Search Box Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-violet-500 transition-all">
              <div className="relative w-full flex-1 flex items-center">
                <svg className="w-5 h-5 absolute left-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Order ID (e.g. #E17841866), or Phone..."
                  className="w-full pl-12 pr-10 py-3.5 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setError(null); }}
                    className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    Track Package
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {error && (
          <div className="p-6 rounded-2xl mb-8 text-center bg-rose-50 border border-rose-200 space-y-1">
            <p className="text-rose-700 font-bold text-base">Order Not Found</p>
            <p className="text-rose-600 text-xs max-w-md mx-auto">{error}</p>
          </div>
        )}

        {order ? (
          <div className="space-y-8">
            {/* Order Overview Header Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-0.5">
                    #{order._id}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isCancelled
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : "bg-violet-100 text-violet-800 border border-violet-200"
                    }`}
                  >
                    {order.status}
                  </span>
                  {!isCancelled && (
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                        (order.status === "delivered" || order.paymentStatus === "paid")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {(order.status === "delivered" || order.paymentStatus === "paid") ? "Paid" : "COD / Pending"}
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Progress Bar Stepper */}
              {!isCancelled && (
                <div className="py-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Delivery Progress</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                    {STEPS.map((step, idx) => {
                      const isDone = currentStep >= idx;
                      const isCurrent = currentStep === idx;

                      return (
                        <div key={step.key} className="flex flex-col items-center text-center space-y-3 relative z-10">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                              isDone
                                ? "bg-slate-950 text-white shadow-md"
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}
                          >
                            {isDone ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${isDone ? "text-slate-950" : "text-slate-400"}`}>
                              {step.title}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                          </div>
                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Two Column Grid: Shipping & Items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Shipping & Payment Info */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">Shipping Details</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Recipient Name</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Address</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {order.shippingAddress?.address}, {order.shippingAddress?.city}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Contact Phone</span>
                    <p className="font-bold text-slate-800 mt-0.5">{order.shippingAddress?.phone}</p>
                  </div>
                  {order.paymentMethod && (
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Payment Method</span>
                      <p className="font-bold text-violet-700 uppercase mt-0.5">{order.paymentMethod}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">Ordered Items ({order.items.length})</h3>

                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 shrink-0">
                            📦
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Qty: {item.quantity} {item.size ? `· Size: ${item.size}` : ""} {item.color ? `· Color: ${item.color}` : ""}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Total Order Amount</span>
                  <span className="text-lg font-bold text-slate-950">৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Status History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">Status Timeline & History</h3>
                <div className="space-y-4">
                  {order.statusHistory.map((hist, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-3 h-3 rounded-full bg-violet-600 mt-1 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">{hist.status}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(hist.updatedAt)}</p>
                        {hist.note && <p className="text-xs text-slate-600 mt-1">{hist.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          !error && (
            <div className="text-center py-16 p-8 rounded-2xl border border-dashed border-slate-200 bg-warm-50">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-2xl mx-auto mb-4">
                🚚
              </div>
              <h3 className="text-base font-semibold text-slate-950">Enter Your Order Details Above</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-light">
                Lookup your order progress, estimated delivery times, and courier updates in seconds.
              </p>
            </div>
          )
        )}

        {/* Support Section */}
        <div className="mt-16 text-center pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Have questions about your delivery?{" "}
            <Link href="/contact" className="text-violet-700 font-bold hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-400 text-sm">
        Loading Track Order...
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
