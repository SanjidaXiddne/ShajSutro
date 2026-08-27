"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getApiBase } from "@/lib/apiBase";
import { DIVISIONS, getDistricts, getThanas } from "@/lib/bangladeshLocations";

const API = getApiBase();

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

interface OrderItem {
  product?: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface ReviewedPair { product: string; order: string; }

interface ReviewDraft {
  orderId: string;
  productId: string;
  productName: string;
}

interface StatusHistoryItem {
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";
  updatedAt: string;
  note?: string;
}

interface ExchangeRequestData {
  requestedAt: string;
  status: "pending" | "approved" | "rejected" | "completed";
  reason: string;
  items: { name: string; size?: string; color?: string; quantity: number }[];
  adminNote?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";
  statusHistory?: StatusHistoryItem[];
  exchangeRequest?: ExchangeRequestData;
  paymentMethod: "bkash" | "nagad" | "rocket" | "cod";
  txnId?: string;
  paymentStatus: "pending_verification" | "pending_delivery" | "paid" | "refunded";
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<Order["status"], { label: string; classes: string }> = {
  pending:   { label: "Pending",         classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  confirmed: { label: "Order Confirmed", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped:   { label: "Shipped",         classes: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  delivered: { label: "Delivered",       classes: "bg-green-50 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled",       classes: "bg-red-50 text-red-600 border-red-200" },
  returned:  { label: "Returned",        classes: "bg-orange-50 text-orange-700 border-orange-200" },
};



function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatDateTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTrackingDateTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = hours.toString().padStart(2, "0");

  return `${month} ${day}, ${year} ${strHours}:${minutes} ${ampm}`;
}

function getTrackingHistoryLogs(order: Order) {
  let logs: { date: string; message: string }[] = [];

  if (order.statusHistory && order.statusHistory.length > 0) {
    logs = order.statusHistory.map((item) => {
      let msg = item.note || "";
      if (!msg || msg.startsWith("Status updated to")) {
        if (item.status === "pending") msg = "Consignment status has been updated as Pending";
        else if (item.status === "confirmed") msg = "Consignment status has been updated as Confirmed";
        else if (item.status === "shipped") msg = "Consignment has been shipped out for delivery";
        else if (item.status === "delivered") msg = "Consignment has been marked as delivered by rider.";
        else if (item.status === "cancelled") msg = "Consignment status has been updated as Cancelled";
      }
      return {
        date: item.updatedAt,
        message: msg,
      };
    });
  } else {
    logs.push({
      date: order.createdAt,
      message: "Consignment status has been updated as Pending",
    });

    const stepOrder = ["confirmed", "shipped", "delivered"];
    const currentIndex = stepOrder.indexOf(order.status);
    if (order.status === "cancelled") {
      logs.push({
        date: order.createdAt,
        message: "Consignment status has been updated as Cancelled",
      });
    } else {
      for (let i = 0; i <= currentIndex; i++) {
        const s = stepOrder[i];
        const msg =
          s === "confirmed"
            ? "Consignment status has been updated as Confirmed"
            : s === "shipped"
            ? "Consignment has been shipped out for delivery"
            : "Consignment has been marked as delivered by rider.";
        logs.push({
          date: order.createdAt,
          message: msg,
        });
      }
    }
  }

  return [...logs].reverse();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "overview" | "orders" | "account" | "addresses" | "security";

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [avatarImg, setAvatarImg] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchUser = useCallback(async () => {
    if (!token) { router.replace("/login"); return; }
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { router.replace("/login"); return; }
      const data = await res.json();
      setUser(data.data);
    } catch {
      router.replace("/login");
    } finally {
      setLoadingUser(false);
    }
  }, [token, router]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data.data ?? []);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (tab === "orders") fetchOrders(); }, [tab, fetchOrders]);

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`user_avatar_${user.id}`);
      setAvatarImg(saved);
    }
  }, [user]);

  const handleAvatarChange = (newImg: string | null) => {
    if (user?.id) {
      if (newImg) {
        localStorage.setItem(`user_avatar_${user.id}`, newImg);
        setAvatarImg(newImg);
      } else {
        localStorage.removeItem(`user_avatar_${user.id}`);
        setAvatarImg(null);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("user_avatar_updated"));
      }
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-charcoal-300 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">

        {/* ── Top header ── */}
        <div className="mb-5 sm:mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">My Account</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-charcoal-950 tracking-tight">
            Hello, {user.name.split(" ")[0]}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ── */}
          <aside className="lg:w-60 shrink-0 space-y-3">
            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-charcoal-100 p-4 sm:p-5 flex flex-col items-center text-center gap-2.5 shadow-2xs">
              {avatarImg ? (
                <div className="w-14 h-14 rounded-full overflow-hidden border border-charcoal-150 shadow-sm bg-warm-50 shrink-0">
                  <img src={avatarImg} alt={user.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-950 flex items-center justify-center text-white text-lg font-semibold tracking-wide select-none shrink-0 shadow-xs">
                  {initials(user.name)}
                </div>
              )}
              <div>
                <p className="font-semibold text-charcoal-950 text-xs sm:text-sm">{user.name}</p>
                <p className="text-xs text-charcoal-400 font-light truncate max-w-[180px]">{user.email}</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-warm-50 border border-charcoal-100 text-charcoal-600 uppercase tracking-wide">
                {user.role}
              </span>
            </div>

            {/* Nav */}
            <nav className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden shadow-2xs">
              {(
                [
                  { id: "overview",  icon: GridIcon,    label: "Overview" },
                  { id: "orders",    icon: BoxIcon,      label: "My Orders" },
                  { id: "account",   icon: UserIcon,     label: "Account Settings" },
                  { id: "addresses", icon: MapPinIcon,   label: "Addresses" },
                  { id: "security",  icon: LockIcon,     label: "Security" },
                ] as { id: Tab; icon: React.FC<{ className?: string }>; label: string }[]
              ).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 border-b border-charcoal-50 last:border-0 relative ${
                    tab === id
                      ? "bg-emerald-950 text-white shadow-xs font-bold"
                      : "text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-950"
                  }`}
                >
                  {tab === id && (
                    <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-400 rounded-r-full" />
                  )}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Logout */}
            <button
              onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 rounded-2xl border border-charcoal-100 transition-all duration-200 shadow-2xs"
            >
              <LogoutIcon className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {tab === "overview"  && <OverviewTab user={user} orders={orders} onFetchOrders={fetchOrders} onTabChange={setTab} />}
            {tab === "orders"    && <OrdersTab orders={orders} onFetch={fetchOrders} token={token!} />}
            {tab === "account"   && (
              <AccountTab
                user={user}
                token={token!}
                onUpdated={fetchUser}
                avatarImg={avatarImg}
                onAvatarChange={handleAvatarChange}
              />
            )}
            {tab === "addresses" && <AddressesTab token={token!} />}
            {tab === "security"  && <SecurityTab token={token!} />}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  user,
  orders,
  onFetchOrders,
  onTabChange,
}: {
  user: UserData;
  orders: Order[];
  onFetchOrders: () => void;
  onTabChange: (t: Tab) => void;
}) {
  useEffect(() => { onFetchOrders(); }, [onFetchOrders]);

  const delivered  = orders.filter((o) => o.status === "delivered").length;
  const active     = orders.filter((o) => ["pending","confirmed","shipped"].includes(o.status)).length;
  const totalSpent = orders.filter((o) => !["cancelled", "returned"].includes(o.status)).reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "Total Orders",    value: orders.length,             icon: BoxIcon },
    { label: "Active Orders",   value: active,                    icon: TruckIcon },
    { label: "Delivered",       value: delivered,                 icon: CheckCircleIcon },
    { label: "Total Spent",     value: `৳${totalSpent.toLocaleString()}`, icon: WalletIcon },
  ];

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-charcoal-100 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-warm-50 border border-charcoal-100 flex items-center justify-center text-charcoal-600 mb-3">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-charcoal-950 tracking-tight">{value}</p>
              <p className="text-xs text-charcoal-400 mt-0.5 font-light">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Member since */}
      <div className="bg-charcoal-950 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-400 mb-1">Member Since</p>
          <p className="text-white font-semibold">{formatDate(user.createdAt!)}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <StarIcon className="w-5 h-5 text-white/70" />
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-charcoal-50 flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-semibold text-charcoal-950">Recent Orders</h2>
            <button
              onClick={() => onTabChange("orders")}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              View all orders &rarr;
            </button>
          </div>
          <div className="divide-y divide-charcoal-50">
            {recentOrders.map((order) => (
              <OrderRow key={order._id} order={order} />
            ))}
          </div>
        </div>
      )}

      {recentOrders.length === 0 && (
        <EmptyState
          icon={BoxIcon}
          title="No orders yet"
          description="Start shopping and your orders will appear here."
          actionLabel="Shop Now"
          actionHref="/shop"
        />
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ orders, onFetch, token }: { orders: Order[]; onFetch: () => void; token: string }) {
  const [reviewedPairs, setReviewedPairs] = useState<Set<string>>(new Set());
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft | null>(null);

  const fetchReviewedPairs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/reviews/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const pairs = (data.data as ReviewedPair[]).map(
        (p) => `${p.order}:${p.product}`,
      );
      setReviewedPairs(new Set(pairs));
    } catch {
      setReviewedPairs(new Set());
    }
  }, [token]);

  useEffect(() => { onFetch(); }, [onFetch]);
  useEffect(() => { fetchReviewedPairs(); }, [fetchReviewedPairs]);

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={BoxIcon}
        title="No orders yet"
        description="When you place orders, they'll show up here."
        actionLabel="Start Shopping"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1 pb-1">
        <h2 className="text-sm sm:text-base font-bold text-charcoal-950">Order History</h2>
        <span className="text-xs text-charcoal-400 font-medium">{sorted.length} order{sorted.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-4">
        {sorted.map((order) => (
          <div key={order._id} className="bg-white rounded-2xl border border-charcoal-150 shadow-2xs overflow-hidden">
            <OrderRow
              order={order}
              expanded
              reviewedPairs={reviewedPairs}
              onWriteReview={(draft) => setReviewDraft(draft)}
              onOrderUpdated={onFetch}
            />
          </div>
        ))}
      </div>

      {reviewDraft && (
        <ReviewModal
          draft={reviewDraft}
          token={token}
          onClose={() => setReviewDraft(null)}
          onSubmitted={async ({ orderId, productId }) => {
            setReviewedPairs((prev) => {
              const next = new Set(prev);
              next.add(`${orderId}:${productId}`);
              return next;
            });
            setReviewDraft(null);
            await fetchReviewedPairs();
          }}
        />
      )}
    </div>
  );
}

const paymentStatusConfig: Record<string, { label: string; classes: string; dot: string }> = {
  pending_verification: { label: "Verifying Payment", classes: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  pending_delivery:     { label: "Awaiting Delivery",  classes: "bg-blue-50 text-blue-700 border-blue-200",   dot: "bg-blue-400" },
  paid:                 { label: "Paid",               classes: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  refunded:             { label: "Payment Returned",   classes: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
};

const methodLabel = (m: Order["paymentMethod"]) =>
  m === "bkash" ? "bKash" : m === "nagad" ? "Nagad" : m === "rocket" ? "Rocket" : "Cash on Delivery";

const TRACKING_STEPS = [
  { key: "pending",   label: "Pending" },
  { key: "confirmed", label: "Order Confirmation" },
  { key: "shipped",   label: "Shipping" },
  { key: "delivered", label: "Delivery" },
];

function OrderStatusStepper({ order }: { order: Order }) {
  const status = order.status;
  if (status === "cancelled") {
    const cancelItem = order.statusHistory?.find((s) => s.status === "cancelled");
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Order Cancelled {cancelItem ? `• ${formatDateTime(cancelItem.updatedAt)}` : ""}
        </div>
        <span className="text-xs text-red-600 font-medium">This order was cancelled</span>
      </div>
    );
  }

  if (status === "returned") {
    const returnItem = order.statusHistory?.find((s) => s.status === "returned");
    return (
      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-orange-700">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H4m0 0l4-4m-4 4l4 4" />
          </svg>
          Order Returned {returnItem ? `• ${formatDateTime(returnItem.updatedAt)}` : ""}
        </div>
        <span className="text-xs text-orange-700 font-medium">This order was returned</span>
      </div>
    );
  }

  const stepOrder = ["pending", "confirmed", "shipped", "delivered"];
  const currentIndex = Math.max(0, stepOrder.indexOf(status));

  const getStepDate = (stepKey: string) => {
    const item = order.statusHistory?.find((s) => s.status === stepKey);
    if (item?.updatedAt) return formatDateTime(item.updatedAt);
    if (stepKey === "pending") return formatDateTime(order.createdAt);
    return null;
  };

  return (
    <div className="mb-4 pb-4 border-b border-charcoal-50">
      <div className="relative flex items-center justify-between max-w-xl mx-auto px-4 sm:px-8">
        {/* Background connector line */}
        <div className="absolute top-3.5 left-10 right-10 h-0.5 bg-charcoal-150 -z-0" />

        {/* Progress active connector line */}
        <div
          className="absolute top-3.5 left-10 h-0.5 bg-charcoal-950 transition-all duration-300 -z-0"
          style={{
            width: `calc(${Math.min(100, (currentIndex / (TRACKING_STEPS.length - 1)) * 100)}% - 20px)`,
          }}
        />

        {TRACKING_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPassedOrCurrent = idx <= currentIndex;
          const stepDate = getStepDate(step.key);

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isPassedOrCurrent
                    ? "bg-charcoal-950 text-white ring-4 ring-white shadow-xs"
                    : "bg-white text-charcoal-300 border-2 border-charcoal-200"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <p
                className={`mt-1.5 text-xs text-center transition-colors ${
                  isCurrent
                    ? "font-bold text-charcoal-950"
                    : isPassedOrCurrent
                    ? "font-medium text-charcoal-700"
                    : "text-charcoal-400 font-light"
                }`}
              >
                {step.label}
              </p>
              {stepDate && (
                <span className="text-xs text-charcoal-400 font-mono mt-0.5 text-center leading-tight">
                  {stepDate}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExchangeModal({
  order,
  token,
  onClose,
  onSubmitted,
}: {
  order: Order;
  token: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [reason, setReason] = useState("Size / Fit Issue");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const finalReason = reason === "Other" ? customReason.trim() : reason;
    if (!finalReason) {
      setError("Please specify a reason for exchange/return.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/orders/${order._id}/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: finalReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit exchange request");
      onSubmitted();
    } catch (err: any) {
      setError(err.message || "Failed to submit exchange request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-charcoal-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-700 p-1.5 rounded-full hover:bg-charcoal-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-charcoal-950">Request Exchange / Return</h3>
            <p className="text-xs text-charcoal-400 font-mono">Order #{order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-2">Reason for Exchange / Return</label>
            <select
              className="input-field bg-white"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="Size / Fit Issue">Size / Fit Issue (Too big / too small)</option>
              <option value="Product Damaged or Defective">Product Damaged or Defective</option>
              <option value="Received Wrong Product">Received Wrong Product or Variant</option>
              <option value="Color / Quality Not Expected">Color / Quality Not Expected</option>
              <option value="Other">Other Reason</option>
            </select>
          </div>

          {reason === "Other" && (
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-2">Please detail your reason</label>
              <textarea
                rows={3}
                className="input-field py-2.5 resize-none"
                placeholder="Explain why you want to exchange or return..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2.5 px-5 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Exchange Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  expanded = false,
  reviewedPairs,
  onWriteReview,
  onOrderUpdated,
}: {
  order: Order;
  expanded?: boolean;
  reviewedPairs?: Set<string>;
  onWriteReview?: (draft: ReviewDraft) => void;
  onOrderUpdated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const cfg    = statusConfig[order.status];
  const payCfg = paymentStatusConfig[order.paymentStatus];

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API}/api/orders/${order._id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel order");
      onOrderUpdated?.();
    } catch (err: any) {
      alert(err.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="px-6 py-5">
      {/* Progress Stepper Bar at Top (Only on Order History Page) */}
      {expanded && <OrderStatusStepper order={order} />}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-mono text-charcoal-400">#{order._id.slice(-8).toUpperCase()}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
              {cfg.label}
            </span>
            {order.paymentStatus === "refunded" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-purple-50 text-purple-700 border-purple-200">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Payment Returned
              </span>
            ) : order.paymentMethod !== "cod" || order.paymentStatus === "paid" ? (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                order.paymentStatus === "paid" ? "bg-green-50 text-green-700 border-green-200" : payCfg.classes
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === "paid" ? "bg-green-500" : payCfg.dot}`} />
                {order.paymentStatus === "paid" ? "Paid" : payCfg.label}
              </span>
            ) : null}
            {order.exchangeRequest && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-orange-50 text-orange-700 border-orange-200 capitalize">
                Exchange: {order.exchangeRequest.status}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-medium text-charcoal-700 mt-1.5">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""} &middot; {methodLabel(order.paymentMethod)}
            {order.txnId && <span className="text-charcoal-400 font-mono text-xs ml-1">(TxnID: {order.txnId})</span>}
          </p>
          <p className="text-xs text-charcoal-400 mt-0.5 font-light">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-2">
          <p className="text-sm sm:text-base font-bold text-charcoal-950">৳{order.total.toLocaleString()}</p>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {order.status === "pending" && (
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all shadow-2xs disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
            {order.status === "delivered" && !order.exchangeRequest && (
              <button
                type="button"
                onClick={() => setShowExchangeModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-xl transition-all shadow-2xs"
              >
                Exchange Product
              </button>
            )}
            {expanded && (
              <button
                onClick={() => setOpen(!open)}
                className="px-3 py-1.5 text-xs font-semibold text-charcoal-700 bg-white border border-charcoal-200 hover:bg-charcoal-50 rounded-xl transition-all shadow-2xs"
              >
                {open ? "Hide Items" : "View Items"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showExchangeModal && (
        <ExchangeModal
          order={order}
          token={localStorage.getItem("token") || ""}
          onClose={() => setShowExchangeModal(false)}
          onSubmitted={() => {
            setShowExchangeModal(false);
            onOrderUpdated?.();
          }}
        />
      )}

      {/* Order Tracking History Log Toggle (Only on Order History Page) */}
      {expanded && (
        <div className="mt-5 pt-4 border-t border-charcoal-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900">
              Order Tracking History
            </h3>
            <button
              type="button"
              onClick={() => setShowTracking(!showTracking)}
              className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[38px] text-xs font-semibold text-charcoal-700 bg-warm-50 hover:bg-charcoal-100 border border-charcoal-200 rounded-xl transition-all shadow-2xs"
            >
              <span>{showTracking ? "Hide History" : "Show History"}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${showTracking ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showTracking && (
            <div className="mt-3 bg-white rounded-xl border border-charcoal-150 divide-y divide-charcoal-100 overflow-hidden shadow-2xs animate-in fade-in duration-200">
              {getTrackingHistoryLogs(order).map((log, idx) => (
                <div key={idx} className="flex items-start px-4 sm:px-5 py-3 hover:bg-warm-50/50 transition-colors">
                  <div className="w-36 sm:w-44 shrink-0 text-xs text-charcoal-500 font-mono font-medium leading-relaxed pr-3">
                    {formatTrackingDateTime(log.date)}
                  </div>
                  <div className="flex-1 text-xs sm:text-sm text-charcoal-800 font-normal leading-relaxed pl-3 border-l border-charcoal-100">
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {expanded && open && (
        <div className="mt-4 border-t border-charcoal-50 pt-4 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="w-12 h-14 rounded-lg object-cover bg-charcoal-50 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal-800 truncate">{item.name}</p>
                <p className="text-xs text-charcoal-400 mt-0.5">{item.size} · {item.color} · Qty {item.quantity}</p>
                {order.status === "delivered" && item.product && (
                  reviewedPairs?.has(`${order._id}:${item.product}`) ? (
                    <span className="inline-flex mt-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                      Reviewed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onWriteReview?.({
                          orderId: order._id,
                          productId: item.product!,
                          productName: item.name,
                        })
                      }
                      className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-charcoal-950 text-white hover:bg-charcoal-800 transition-colors"
                    >
                      Write Review
                    </button>
                  )
                )}
              </div>
              <p className="text-sm font-semibold text-charcoal-950 shrink-0">৳{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}

          <div className="mt-3 pt-3 border-t border-charcoal-100 space-y-2 text-xs text-charcoal-500">
            <div className="flex justify-between"><span>Subtotal</span><span>৳{(order.subtotal ?? order.total).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : `৳${(order.shippingCost ?? 0).toFixed(2)}`}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600 font-medium"><span>Discount (Promo)</span><span>−৳{order.discount.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-sm text-charcoal-950 pt-1.5 border-t border-charcoal-100"><span>Total</span><span>৳{order.total.toFixed(2)}</span></div>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    window.location.href = "/login";
                    return;
                  }
                  const res = await fetch(`${API}/api/orders/${order._id}/invoice`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  if (!res.ok) {
                    throw new Error("Failed to download invoice");
                  }
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `invoice-${order._id}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch {
                  // Silently fail or show basic alert; avoid complex UI here
                  alert("Could not download invoice. Please try again.");
                }
              }}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-charcoal-200 text-[11px] font-medium text-charcoal-700 hover:bg-charcoal-50"
            >
              Download Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewModal({
  draft,
  token,
  onClose,
  onSubmitted,
}: {
  draft: ReviewDraft;
  token: string;
  onClose: () => void;
  onSubmitted: (payload: { orderId: string; productId: string }) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: draft.productId,
          orderId: draft.orderId,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Failed to submit review");
      }

      await onSubmitted({ orderId: draft.orderId, productId: draft.productId });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border border-charcoal-100 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-charcoal-50 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-charcoal-950">Write a Review</p>
            <p className="text-xs text-charcoal-400 mt-0.5 line-clamp-1">{draft.productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-charcoal-50 text-charcoal-400 hover:text-charcoal-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <p className="text-xs font-medium text-charcoal-600 mb-2">Rating</p>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hovered || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    className="p-1"
                    aria-label={`Set ${star} star rating`}
                  >
                    <svg
                      className={`w-6 h-6 ${active ? "text-amber-500" : "text-charcoal-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-2">Comment</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product"
              className="input-field resize-none"
            />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg text-xs bg-red-50 border border-red-200 text-red-600">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-charcoal-950 text-white text-sm font-semibold hover:bg-charcoal-800 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Account Settings Tab ─────────────────────────────────────────────────────

function AccountTab({
  user,
  token,
  onUpdated,
  avatarImg,
  onAvatarChange,
}: {
  user: UserData;
  token: string;
  onUpdated: () => void;
  avatarImg: string | null;
  onAvatarChange: (newImg: string | null) => void;
}) {
  const [name, setName]   = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Check image type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      return;
    }
    // Limit to 1.5MB to avoid localStorage overflow
    if (file.size > 1.5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        onAvatarChange(event.target.result);
      } else {
        setUploadError("Failed to read image file.");
      }
    };
    reader.onerror = () => {
      setUploadError("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Update failed");
      setMsg({ type: "success", text: "Profile updated successfully." });
      onUpdated();
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-charcoal-50">
        <h2 className="text-sm font-semibold text-charcoal-950">Account Settings</h2>
        <p className="text-xs text-charcoal-400 mt-0.5">Update your personal information</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {msg && (
          <div className={`px-4 py-3 rounded-xl text-sm border ${
            msg.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
            {msg.text}
          </div>
        )}

        {/* Profile Picture Upload Zone */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-charcoal-50">
          <div className="relative shrink-0">
            {avatarImg ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border border-charcoal-150 shadow-sm bg-warm-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarImg} alt={user.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-charcoal-950 flex items-center justify-center text-white text-2xl font-semibold select-none">
                {initials(user.name)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">Profile Picture</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
              <label
                htmlFor="storefront-avatar-upload"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-charcoal-200 hover:border-charcoal-450 bg-white text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 transition-all cursor-pointer active:scale-[0.97]"
              >
                <svg className="w-3.5 h-3.5 text-charcoal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Photo
              </label>
              <input
                type="file"
                id="storefront-avatar-upload"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {avatarImg && (
                <button
                  type="button"
                  onClick={() => onAvatarChange(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 hover:border-red-300 bg-red-50 text-xs font-semibold text-red-600 hover:text-red-700 transition-all active:scale-[0.97]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Photo
                </button>
              )}
            </div>
            <p className="text-xs text-charcoal-400 font-light">JPG, PNG, WEBP or GIF. Max size 1.5MB.</p>
            {uploadError && (
              <p className="text-xs font-semibold text-red-600 mt-1">{uploadError}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal-600 mb-2">Full Name</label>
          <input
            type="text"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal-600 mb-2">Email Address</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal-600 mb-2">Phone Number</label>
          <input
            type="tel"
            className="input-field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 01XXXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal-600 mb-2">Account Type</label>
          <input
            type="text"
            className="input-field bg-charcoal-50 text-charcoal-400 cursor-not-allowed"
            value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            readOnly
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <SmallSpinner /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab({ token }: { token: string }) {
  const [current, setCurrent]   = useState("");
  const [newPass, setNewPass]   = useState("");
  const [confirm, setConfirm]   = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (newPass !== confirm) { setMsg({ type: "error", text: "Passwords do not match." }); return; }
    if (newPass.length < 6)  { setMsg({ type: "error", text: "Password must be at least 6 characters." }); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to change password");
      setMsg({ type: "success", text: "Password changed successfully." });
      setCurrent(""); setNewPass(""); setConfirm("");
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-charcoal-50">
        <h2 className="text-sm font-semibold text-charcoal-950">Security</h2>
        <p className="text-xs text-charcoal-400 mt-0.5">Keep your account safe</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {msg && (
          <div className={`px-4 py-3 rounded-xl text-sm border ${
            msg.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
            {msg.text}
          </div>
        )}

        {[
          { label: "Current Password", value: current, onChange: setCurrent, placeholder: "Enter current password" },
          { label: "New Password",     value: newPass, onChange: setNewPass, placeholder: "Min. 6 characters" },
          { label: "Confirm Password", value: confirm, onChange: setConfirm, placeholder: "Repeat new password" },
        ].map(({ label, value, onChange, placeholder }) => (
          <div key={label}>
            <label className="block text-xs font-medium text-charcoal-600 mb-2">{label}</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className="input-field pr-11"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-600 transition-colors"
              >
                <EyeIconSmall open={show} />
              </button>
            </div>
          </div>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <SmallSpinner /> : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Addresses Tab ─────────────────────────────────────────────────────────────

interface AddressItem {
  _id?: string;
  label?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isDefault?: boolean;
}

function AddressesTab({ token }: { token: string }) {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<AddressItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState<Omit<AddressItem, "_id">>({
    label: "Home",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Bangladesh",
    isDefault: false,
  });

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/auth/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.data ?? []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAddModal = () => {
    setEditingAddr(null);
    setFormData({
      label: "Home",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "Bangladesh",
      isDefault: addresses.length === 0,
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (addr: AddressItem) => {
    setEditingAddr(addr);
    setFormData({
      label: addr.label || "Home",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.zip || "",
      country: addr.country || "Bangladesh",
      isDefault: addr.isDefault || false,
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const url = editingAddr?._id
        ? `${API}/api/auth/addresses/${editingAddr._id}`
        : `${API}/api/auth/addresses`;
      const method = editingAddr?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");

      setAddresses(data.data ?? []);
      setSuccessMsg(editingAddr ? "Address updated successfully" : "Address added successfully");
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`${API}/api/auth/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete address");

      setAddresses(data.data ?? []);
      setSuccessMsg("Address deleted successfully");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id?: string) => {
    if (!id) return;

    try {
      const res = await fetch(`${API}/api/auth/addresses/${id}/default`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to set default address");

      setAddresses(data.data ?? []);
      setSuccessMsg("Default address updated");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update default address");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal-100 p-8 flex items-center justify-center min-h-[300px]">
        <SmallSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-950">Saved Addresses</h2>
          <p className="text-xs text-charcoal-400 font-light mt-0.5">
            Manage your shipping and delivery addresses for faster checkout
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary px-5 py-2.5 text-xs inline-flex items-center justify-center gap-2 shrink-0"
        >
          <span className="text-base leading-none">+</span> Add New Address
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-12 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-50 flex items-center justify-center">
            <MapPinIcon className="w-6 h-6 text-charcoal-400" />
          </div>
          <div>
            <p className="font-semibold text-charcoal-950 text-sm">No addresses saved yet</p>
            <p className="text-xs text-charcoal-400 mt-1 font-light">
              Add your delivery address to quickly select it during checkout.
            </p>
          </div>
          <button onClick={openAddModal} className="btn-primary mt-2 px-6 py-2.5 text-xs">
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                addr.isDefault
                  ? "border-charcoal-950 shadow-sm"
                  : "border-charcoal-100 hover:border-charcoal-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-charcoal-50 border border-charcoal-100 text-charcoal-700">
                      {addr.label || "Home"}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Default
                      </span>
                    )}
                  </div>
                </div>

                <p className="font-semibold text-charcoal-950 text-sm whitespace-pre-line leading-relaxed">
                  {addr.address}
                </p>
                {(addr.zip || addr.state || addr.city) && (
                  <p className="text-xs text-charcoal-500 mt-1.5 font-light">
                    {[addr.zip && `Thana: ${addr.zip}`, addr.state && `District: ${addr.state}`, addr.city && `Division: ${addr.city}`].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-charcoal-50 flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="text-charcoal-700 hover:text-charcoal-950 underline underline-offset-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-red-500 hover:text-red-600 underline underline-offset-2"
                  >
                    Delete
                  </button>
                </div>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-xs text-charcoal-500 hover:text-charcoal-950 font-normal"
                  >
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-charcoal-100 max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-charcoal-950">
                {editingAddr ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
                  Address Label
                </label>
                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setFormData({ ...formData, label: lbl })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        formData.label === lbl
                          ? "bg-charcoal-950 text-white border-charcoal-950"
                          : "bg-white text-charcoal-600 border-charcoal-200 hover:border-charcoal-300"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-600 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type your detailed address (House no, Road no, Area, Landmark...)"
                  className="input-field py-2.5 resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Division */}
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="input-field bg-white"
                    value={formData.city || ""}
                    onChange={(e) => {
                      const newDiv = e.target.value;
                      setFormData({
                        ...formData,
                        city: newDiv,
                        state: "",
                        zip: "",
                      });
                    }}
                  >
                    <option value="">Select Division</option>
                    {DIVISIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="input-field bg-white disabled:opacity-50 disabled:bg-charcoal-50"
                    disabled={!formData.city}
                    value={formData.state || ""}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setFormData({
                        ...formData,
                        state: newDist,
                        zip: "",
                      });
                    }}
                  >
                    <option value="">
                      {!formData.city ? "Select Division First" : "Select District"}
                    </option>
                    {getDistricts(formData.city || "").map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thana */}
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1">
                    Thana <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="input-field bg-white disabled:opacity-50 disabled:bg-charcoal-50"
                    disabled={!formData.state}
                    value={formData.zip || ""}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  >
                    <option value="">
                      {!formData.state ? "Select District First" : "Select Thana"}
                    </option>
                    {getThanas(formData.city || "", formData.state || "").map((thana) => (
                      <option key={thana} value={thana}>
                        {thana}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-charcoal-950 focus:ring-charcoal-950 border-charcoal-300"
                />
                <label htmlFor="isDefaultCheckbox" className="text-xs text-charcoal-700">
                  Set as default shipping address
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-charcoal-200 text-xs font-medium text-charcoal-600 hover:bg-charcoal-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-6 py-2.5 text-xs disabled:opacity-50"
                >
                  {submitting ? <SmallSpinner /> : editingAddr ? "Save Changes" : "Add Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-charcoal-100 p-14 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-charcoal-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-charcoal-400" />
      </div>
      <div>
        <p className="font-semibold text-charcoal-900">{title}</p>
        <p className="text-sm text-charcoal-400 mt-1 font-light">{description}</p>
      </div>
      <a href={actionHref} className="btn-primary mt-1 px-7 py-3">
        {actionLabel}
      </a>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function EyeIconSmall({ open }: { open: boolean }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      )}
    </svg>
  );
}

function SmallSpinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
