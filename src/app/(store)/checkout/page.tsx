"use client";

import DemoMfsGatewayModal from "@/components/checkout/DemoMfsGatewayModal";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getApiBase } from "@/lib/apiBase";
import { DIVISIONS, getDistricts, getThanas } from "@/lib/bangladeshLocations";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/notify";

const API = getApiBase();

interface PromoResult {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discount: number;
  finalTotal: number;
  description: string;
}

const steps = ["Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { state, subtotal, totalItems, clearCart } = useCart();

  // ── Promo code state ──────────────────────────────────────────────────────
  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError("");
    setPromoResult(null);
    setPromoLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API}/api/promo-codes/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: promoInput.trim(),
          cartTotal: subtotal,
          email: shippingInfo.email?.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Invalid promo code");
      setPromoResult(data.data);
      notifySuccess(`Promo applied: ${data.data?.code ?? promoInput.trim()}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setPromoError(message);
      notifyError(message);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoResult(null);
    setPromoInput("");
    setPromoError("");
  };
  // ─────────────────────────────────────────────────────────────────────────

  const shipping = subtotal >= 1200 ? 0 : 9.99;
  const tax = 0;
  const discount = promoResult?.discount ?? 0;
  const total = subtotal + shipping - discount;

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "BD",
  });

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      notifyInfo("Please log in to proceed with your checkout.");
      router.push("/login?redirect=/checkout");
      return;
    }

    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          const user = data.data;
          const defaultAddr =
            user.addresses?.find((a: any) => a.isDefault) ||
            user.addresses?.[0];
          setShippingInfo((prev) => ({
            ...prev,
            firstName:
              defaultAddr?.firstName ||
              user.name?.split(" ")[0] ||
              prev.firstName,
            lastName:
              defaultAddr?.lastName ||
              user.name?.split(" ").slice(1).join(" ") ||
              prev.lastName,
            email: user.email || prev.email,
            phone: defaultAddr?.phone || prev.phone,
            address: defaultAddr?.address || prev.address,
            city: defaultAddr?.city || prev.city,
            state: defaultAddr?.state || prev.state,
            zip: defaultAddr?.zip || prev.zip,
            country: defaultAddr?.country || prev.country || "BD",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const [shippingErrors, setShippingErrors] = useState<
    Partial<Record<keyof typeof shippingInfo, string>>
  >({});

  const validateShipping = (): boolean => {
    const errors: Partial<Record<keyof typeof shippingInfo, string>> = {};
    if (!shippingInfo.firstName.trim())
      errors.firstName = "First name is required";
    if (!shippingInfo.lastName.trim())
      errors.lastName = "Last name is required";
    if (!shippingInfo.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email))
      errors.email = "Enter a valid email";
    if (!shippingInfo.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^01[3-9]\d{8}$/.test(shippingInfo.phone.trim())) {
      errors.phone = "Phone number must be valid 11 digits (e.g. 017XXXXXXXX)";
    }
    if (!shippingInfo.address.trim()) errors.address = "Address is required";
    if (!shippingInfo.city.trim()) errors.city = "Division is required";
    if (!shippingInfo.state.trim()) errors.state = "District is required";
    if (!shippingInfo.zip.trim()) errors.zip = "Thana is required";
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const MERCHANT_NUMBER = "01841890199";

  const [paymentInfo, setPaymentInfo] = useState({
    method: "" as "bkash" | "nagad" | "rocket" | "cod" | "",
    txnId: "",
  });
  const [paymentErrors, setPaymentErrors] = useState<{
    method?: string;
    txnId?: string;
  }>({});
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  const validatePayment = (): boolean => {
    const errors: { method?: string; txnId?: string } = {};
    if (!paymentInfo.method) {
      errors.method = "Please select a payment method";
    } else if (paymentInfo.method !== "cod") {
      if (!paymentInfo.txnId.trim()) {
        errors.txnId =
          "Please click 'Pay Now' above to complete the gateway payment";
      }
    }
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [orderError, setOrderError] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [placedOrderData, setPlacedOrderData] = useState<{
    _id?: string;
    total?: number;
  } | null>(null);

  const handlePlaceOrder = async (overrideTxnId?: string) => {
    const finalTxnId = overrideTxnId || paymentInfo.txnId;
    setIsPlacingOrder(true);
    setOrderError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const message =
          "You must be logged in to place an order. Please sign in.";
        setOrderError(message);
        notifyError(message);
        setIsPlacingOrder(false);
        return;
      }

      const body = {
        shippingAddress: shippingInfo,
        paymentMethod: paymentInfo.method,
        txnId: finalTxnId,
        discount,
        promoCode: promoResult?.code ?? "",
        items: state.items
          .filter((i) => Boolean(i && i.product))
          .map((i) => ({
            // Prefer Mongo _id when products are loaded from backend
            productId: ((i.product as unknown as { _id?: string })._id ??
              i.product.id ??
              "") as string,
            name: i.product.name ?? "Product",
            price: i.product.price ?? 0,
            quantity: i.quantity ?? 1,
            size: i.size,
            color: i.color,
            image: i.product.images?.[0] ?? "",
          })),
      };

      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to place order");

      setPlacedOrderData(data.data);
      setPlacedOrderId(data.data._id ?? "");
      clearCart();
      setOrderPlaced(true);
      notifySuccess("Order placed successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setOrderError(message);
      notifyError(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    const isMFS = paymentInfo.method !== "cod";
    const methodLabel =
      paymentInfo.method === "bkash"
        ? "bKash"
        : paymentInfo.method === "nagad"
          ? "Nagad"
          : paymentInfo.method === "rocket"
            ? "Rocket"
            : "";
    const confirmedTotal = placedOrderData?.total ?? Math.max(0, total);
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center px-6 py-20">
        <div className="bg-white rounded-3xl shadow-soft border border-charcoal-100 p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-7">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-charcoal-950 mb-2 tracking-tight">
            Order Placed!
          </h1>
          {placedOrderId && (
            <p className="text-xs text-charcoal-300 font-mono mb-5">
              Order ID: {placedOrderId}
            </p>
          )}

          {isMFS ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-6 text-left shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-bold text-emerald-950">
                  ✓ Payment Confirmed (Paid)
                </p>
              </div>
              <p className="text-xs text-emerald-800 font-light leading-relaxed">
                Your <strong>{methodLabel}</strong> payment of{" "}
                <strong>৳{confirmedTotal.toFixed(2)}</strong> (TxnID:{" "}
                <strong className="font-mono font-bold text-emerald-950">
                  {paymentInfo.txnId}
                </strong>
                ) has been successfully received & verified. Your order is now
                confirmed!
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-6 text-left">
              <p className="text-sm font-bold text-blue-900 mb-1">
                📦 Cash on Delivery Selected
              </p>
              <p className="text-xs text-blue-700 font-light leading-relaxed">
                Please have <strong>৳{confirmedTotal.toFixed(2)}</strong> ready
                when our delivery agent arrives.
              </p>
            </div>
          )}

          <p className="text-xs text-charcoal-400 font-light mb-7">
            Estimated delivery: 3–5 business days &middot; Updates sent to{" "}
            <strong className="text-charcoal-600">
              {shippingInfo.email || "shajsutro@gmail.com"}
            </strong>
          </p>
          <div className="flex gap-3">
            <Link href="/profile" className="btn-secondary flex-1">
              My Orders
            </Link>
            <Link href="/shop" className="btn-primary flex-1">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-charcoal-950 mb-4">
          Your cart is empty
        </h1>
        <Link href="/shop" className="btn-primary mt-4">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/"
            className="text-xl font-bold text-charcoal-950 tracking-tight"
          >
            ShajSutro
          </Link>
          <Link
            href="/cart"
            className="text-sm text-charcoal-500 hover:text-charcoal-900 transition-colors duration-300 group flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Cart
          </Link>
        </div>

        <div className="flex items-center justify-center mb-12">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    idx < currentStep
                      ? "bg-green-600 text-white cursor-pointer hover:bg-green-700"
                      : idx === currentStep
                        ? "bg-charcoal-950 text-white"
                        : "bg-charcoal-200 text-charcoal-400"
                  }`}
                >
                  {idx < currentStep ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </button>
                <span
                  className={`text-xs mt-2 font-medium ${idx === currentStep ? "text-charcoal-950" : "text-charcoal-300"}`}
                >
                  {step}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-24 sm:w-36 h-0.5 mx-4 mb-5 transition-colors duration-400 ${idx < currentStep ? "bg-green-400" : "bg-charcoal-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-7 sm:p-9 shadow-soft border border-charcoal-100">
              {currentStep === 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-charcoal-950 mb-1">
                    Shipping Information
                  </h2>
                  <p className="text-xs text-charcoal-400 font-light mb-7">
                    Fields marked <span className="text-red-500">*</span> are
                    required
                  </p>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-charcoal-600 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={`input-field ${shippingErrors.firstName ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                        placeholder="Rahim"
                        value={shippingInfo.firstName}
                        onChange={(e) => {
                          setShippingInfo({
                            ...shippingInfo,
                            firstName: e.target.value,
                          });
                          setShippingErrors({
                            ...shippingErrors,
                            firstName: "",
                          });
                        }}
                      />
                      {shippingErrors.firstName && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {shippingErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-charcoal-600 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={`input-field ${shippingErrors.lastName ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                        placeholder="Uddin"
                        value={shippingInfo.lastName}
                        onChange={(e) => {
                          setShippingInfo({
                            ...shippingInfo,
                            lastName: e.target.value,
                          });
                          setShippingErrors({
                            ...shippingErrors,
                            lastName: "",
                          });
                        }}
                      />
                      {shippingErrors.lastName && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {shippingErrors.lastName}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-charcoal-600 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={`input-field ${shippingErrors.email ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                        type="email"
                        placeholder="rahim@example.com"
                        value={shippingInfo.email}
                        onChange={(e) => {
                          setShippingInfo({
                            ...shippingInfo,
                            email: e.target.value,
                          });
                          setShippingErrors({ ...shippingErrors, email: "" });
                        }}
                      />
                      {shippingErrors.email && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {shippingErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-charcoal-600 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={`input-field ${shippingErrors.phone ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                        type="tel"
                        maxLength={11}
                        placeholder="01XXXXXXXXX"
                        value={shippingInfo.phone}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 11);
                          setShippingInfo({ ...shippingInfo, phone: val });
                          if (val && !/^01[3-9]\d{8}$/.test(val)) {
                            setShippingErrors({
                              ...shippingErrors,
                              phone:
                                "Phone number must be valid 11 digits (e.g. 017XXXXXXXX)",
                            });
                          } else {
                            setShippingErrors({ ...shippingErrors, phone: "" });
                          }
                        }}
                      />
                      {shippingErrors.phone && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {shippingErrors.phone}
                        </p>
                      )}
                    </div>
                    {/* Address Box */}
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-charcoal-600 mb-2">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        className={`input-field py-2.5 resize-none ${shippingErrors.address ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                        placeholder="House no, Road no, Area, Village, Landmark..."
                        value={shippingInfo.address}
                        onChange={(e) => {
                          setShippingInfo({
                            ...shippingInfo,
                            address: e.target.value,
                          });
                          setShippingErrors({ ...shippingErrors, address: "" });
                        }}
                      />
                      {shippingErrors.address && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {shippingErrors.address}
                        </p>
                      )}
                    </div>

                    {/* Division */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-medium text-charcoal-600 mb-2">
                        Division <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`input-field bg-white ${shippingErrors.city ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                        value={shippingInfo.city}
                        onChange={(e) => {
                          const newDiv = e.target.value;
                          setShippingInfo({
                            ...shippingInfo,
                            city: newDiv,
                            state: "",
                            zip: "",
                          });
                          setShippingErrors({
                            ...shippingErrors,
                            city: "",
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
                      {shippingErrors.city && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {shippingErrors.city}
                        </p>
                      )}
                    </div>

                    {/* District */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-medium text-charcoal-600 mb-2">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        disabled={!shippingInfo.city}
                        className={`input-field bg-white disabled:opacity-50 disabled:bg-charcoal-50 ${shippingErrors.state ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                        value={shippingInfo.state}
                        onChange={(e) => {
                          const newDist = e.target.value;
                          setShippingInfo({
                            ...shippingInfo,
                            state: newDist,
                            zip: "",
                          });
                          setShippingErrors({
                            ...shippingErrors,
                            state: "",
                            zip: "",
                          });
                        }}
                      >
                        <option value="">
                          {!shippingInfo.city
                            ? "Select Division First"
                            : "Select District"}
                        </option>
                        {getDistricts(shippingInfo.city).map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                      {shippingErrors.state && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {shippingErrors.state}
                        </p>
                      )}
                    </div>

                    {/* Thana */}
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-charcoal-600 mb-2">
                        Thana <span className="text-red-500">*</span>
                      </label>
                      <select
                        disabled={!shippingInfo.state}
                        className={`input-field bg-white disabled:opacity-50 disabled:bg-charcoal-50 ${shippingErrors.zip ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                        value={shippingInfo.zip}
                        onChange={(e) => {
                          setShippingInfo({
                            ...shippingInfo,
                            zip: e.target.value,
                          });
                          setShippingErrors({ ...shippingErrors, zip: "" });
                        }}
                      >
                        <option value="">
                          {!shippingInfo.state
                            ? "Select District First"
                            : "Select Thana"}
                        </option>
                        {getThanas(shippingInfo.city, shippingInfo.state).map(
                          (thana) => (
                            <option key={thana} value={thana}>
                              {thana}
                            </option>
                          ),
                        )}
                      </select>
                      {shippingErrors.zip && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {shippingErrors.zip}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (validateShipping()) setCurrentStep(1);
                    }}
                    className="btn-primary w-full mt-7"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-charcoal-950 mb-1">
                    Payment Details
                  </h2>
                  <p className="text-xs text-charcoal-400 font-light mb-7">
                    Choose your preferred payment method
                  </p>

                  {/* ── Payment method selector ── */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    {[
                      {
                        id: "bkash",
                        logo: "/images/bkash.jpg",
                        alt: "bKash",
                        desc: "Mobile Banking",
                      },
                      {
                        id: "nagad",
                        logo: "/images/Nagad.png",
                        alt: "Nagad",
                        desc: "Mobile Banking",
                      },
                      {
                        id: "rocket",
                        logo: "/images/rocket.jpg",
                        alt: "Rocket",
                        desc: "DBBL Mobile Banking",
                      },
                      {
                        id: "cod",
                        logo: null,
                        alt: "Cash on Delivery",
                        desc: "Pay when delivered",
                      },
                    ].map((m) => {
                      const active = paymentInfo.method === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setPaymentInfo({ method: m.id as any, txnId: "" });
                            setPaymentErrors({});
                          }}
                          className={`relative flex flex-col items-start justify-between gap-3 px-4 py-4 rounded-2xl border-2 transition-all duration-200 text-left min-h-[92px] ${
                            active
                              ? "border-charcoal-950 shadow-md bg-warm-50/20"
                              : "border-charcoal-200 hover:border-charcoal-400 bg-white"
                          }`}
                        >
                          {active && (
                            <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-charcoal-950 flex items-center justify-center">
                              <svg
                                className="w-2.5 h-2.5 text-white"
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
                          {m.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.logo}
                              alt={m.alt}
                              className="h-7 max-w-[120px] object-contain shrink-0"
                            />
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-charcoal-950 text-white">
                              <svg
                                className="w-4 h-4 text-amber-400 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              <span className="text-xs font-bold">
                                Cash on Delivery
                              </span>
                            </div>
                          )}
                          <span className="text-[11px] text-charcoal-400 font-light">
                            {m.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {paymentErrors.method && (
                    <p className="mt-3 mb-1 text-xs text-red-500 flex items-center gap-1">
                      <svg
                        className="w-3 h-3 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {paymentErrors.method}
                    </p>
                  )}

                  {/* ── MFS instructions + TxnID ── */}
                  {paymentInfo.method &&
                    paymentInfo.method !== "cod" &&
                    (() => {
                      const methodLabel =
                        paymentInfo.method === "bkash"
                          ? "bKash"
                          : paymentInfo.method === "nagad"
                            ? "Nagad"
                            : "Rocket";
                      const accentBg =
                        paymentInfo.method === "bkash"
                          ? "bg-[#fce7f0] border-[#f9a8ce]"
                          : paymentInfo.method === "nagad"
                            ? "bg-[#fff0ea] border-[#ffc4a8]"
                            : "bg-[#f3e8ff] border-[#d8b4fe]";
                      const accentText =
                        paymentInfo.method === "bkash"
                          ? "text-[#9d0f4e]"
                          : paymentInfo.method === "nagad"
                            ? "text-[#b03a0d]"
                            : "text-[#5b21b6]";
                      const numBg =
                        paymentInfo.method === "bkash"
                          ? "bg-[#E2136E]"
                          : paymentInfo.method === "nagad"
                            ? "bg-[#F05A28]"
                            : "bg-[#8C3494]";
                      return (
                        <div className="mt-5 space-y-4">
                          {/* Instant Demo Gateway Action Card */}
                          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Instant Gateway Payment
                              </span>
                              <h4 className="text-lg font-bold text-white mt-2">
                                Pay via {methodLabel} Online Gateway
                              </h4>
                              <p className="text-xs text-slate-300 font-light mt-0.5">
                                Click below to open the official {methodLabel}{" "}
                                payment popup & complete transaction.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (validateShipping()) {
                                  setIsGatewayOpen(true);
                                } else {
                                  notifyError(
                                    "Please complete your shipping address details first.",
                                  );
                                }
                              }}
                              className={`w-full sm:w-auto px-7 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all ${numBg} hover:opacity-90 flex items-center justify-center gap-2 shrink-0`}
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
                                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              Pay ৳{total.toFixed(2)} Now
                            </button>
                          </div>

                          {paymentInfo.txnId ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                  ✓
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-emerald-950">
                                    {methodLabel} Gateway Payment Verified
                                  </p>
                                  <p className="text-[11px] font-mono text-emerald-700 font-semibold">
                                    TxnID: {paymentInfo.txnId}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsGatewayOpen(true)}
                                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors"
                              >
                                Re-open Gateway
                              </button>
                            </div>
                          ) : (
                            paymentErrors.txnId && (
                              <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl p-3">
                                <svg
                                  className="w-4 h-4 shrink-0 text-red-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {paymentErrors.txnId}
                              </p>
                            )
                          )}
                        </div>
                      );
                    })()}

                  {/* ── Cash on Delivery note ── */}
                  {paymentInfo.method === "cod" && (
                    <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                      <svg
                        className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        />
                      </svg>
                      <div className="text-xs text-amber-800 space-y-1 leading-relaxed">
                        <p className="font-semibold">
                          Cash on Delivery selected
                        </p>
                        <p className="font-light">
                          Please have exactly{" "}
                          <strong>৳{total.toFixed(2)}</strong> ready when our
                          delivery agent arrives. No advance payment needed.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-6 text-xs text-charcoal-400">
                    <svg
                      className="w-4 h-4 text-green-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                    <span className="font-light">
                      Your payment information is safe and secure.
                    </span>
                  </div>

                  <div className="flex gap-3 mt-7">
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                    {paymentInfo.method === "cod" && (
                      <button
                        onClick={() => {
                          if (validatePayment()) setCurrentStep(2);
                        }}
                        className="btn-primary flex-1"
                      >
                        Review Order
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-charcoal-950 mb-7">
                    Review Your Order
                  </h2>

                  <div className="space-y-6">
                    <div className="bg-warm-50 rounded-xl p-5 border border-warm-100">
                      <div className="flex items-center justify-between mb-2.5">
                        <h3 className="text-sm font-semibold text-charcoal-900">
                          Shipping to
                        </h3>
                        <button
                          onClick={() => setCurrentStep(0)}
                          className="text-xs text-accent-600 hover:text-accent-700 font-medium transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-charcoal-500 font-light leading-relaxed">
                        {shippingInfo.firstName} {shippingInfo.lastName} &bull;{" "}
                        {shippingInfo.phone}
                        <br />
                        {shippingInfo.address && (
                          <>
                            {shippingInfo.address}
                            <br />
                          </>
                        )}
                        {[
                          shippingInfo.zip && `Thana: ${shippingInfo.zip}`,
                          shippingInfo.state &&
                            `District: ${shippingInfo.state}`,
                          shippingInfo.city && `Division: ${shippingInfo.city}`,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>

                    <div className="bg-warm-50 rounded-xl p-5 border border-warm-100">
                      <div className="flex items-center justify-between mb-2.5">
                        <h3 className="text-sm font-semibold text-charcoal-900">
                          Payment
                        </h3>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-xs text-accent-600 hover:text-accent-700 font-medium transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-charcoal-500 font-light">
                        {paymentInfo.method === "bkash" && (
                          <>
                            <span className="font-semibold text-[#E2136E]">
                              bKash
                            </span>
                            {paymentInfo.txnId ? (
                              <>
                                {" "}
                                &mdash; TxnID:{" "}
                                <span className="font-mono font-semibold text-charcoal-800">
                                  {paymentInfo.txnId}
                                </span>
                              </>
                            ) : (
                              ""
                            )}
                          </>
                        )}
                        {paymentInfo.method === "nagad" && (
                          <>
                            <span className="font-semibold text-[#F05A28]">
                              Nagad
                            </span>
                            {paymentInfo.txnId ? (
                              <>
                                {" "}
                                &mdash; TxnID:{" "}
                                <span className="font-mono font-semibold text-charcoal-800">
                                  {paymentInfo.txnId}
                                </span>
                              </>
                            ) : (
                              ""
                            )}
                          </>
                        )}
                        {paymentInfo.method === "rocket" && (
                          <>
                            <span className="font-semibold text-[#8C3494]">
                              Rocket
                            </span>
                            {paymentInfo.txnId ? (
                              <>
                                {" "}
                                &mdash; TxnID:{" "}
                                <span className="font-mono font-semibold text-charcoal-800">
                                  {paymentInfo.txnId}
                                </span>
                              </>
                            ) : (
                              ""
                            )}
                          </>
                        )}
                        {paymentInfo.method === "cod" && (
                          <span className="font-semibold text-charcoal-800">
                            Cash on Delivery
                          </span>
                        )}
                        {!paymentInfo.method && "—"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-charcoal-900 mb-4">
                        Items ({totalItems})
                      </h3>
                      <div className="space-y-3">
                        {state.items
                          .filter((i) => Boolean(i && i.product))
                          .map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-warm-50 flex-shrink-0 shadow-soft">
                                {item.product.images?.[0] ? (
                                  <Image
                                    src={item.product.images[0]}
                                    alt={item.product.name ?? "Product"}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-200" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-charcoal-900 truncate">
                                  {item.product.name ?? "Product"}
                                </p>
                                <p className="text-xs text-charcoal-400 font-light">
                                  {item.size} &middot; {item.color} &middot; Qty{" "}
                                  {item.quantity}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-charcoal-900 flex-shrink-0">
                                ৳
                                {(
                                  (item.product.price ?? 0) * item.quantity
                                ).toFixed(2)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {orderError && (
                    <div className="mt-6 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <svg
                        className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs text-red-700 font-light">
                        {orderError}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 mt-9">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handlePlaceOrder()}
                      disabled={isPlacingOrder}
                      className="btn-accent flex-1 relative"
                    >
                      {isPlacingOrder ? (
                        <span className="flex items-center justify-center gap-2">
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
                          Processing...
                        </span>
                      ) : (
                        `Place Order · ৳${total.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-7 shadow-soft border border-charcoal-100 sticky top-28">
              <h3 className="text-base font-semibold text-charcoal-950 mb-6">
                Order Summary
              </h3>

              {/* Items list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {state.items
                  .filter((i) => Boolean(i && i.product))
                  .map((item, idx) => (
                    <div key={idx} className="flex gap-3.5">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-warm-50 flex-shrink-0 shadow-soft">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name ?? "Product"}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200" />
                        )}
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-charcoal-700 text-white text-[10px] flex items-center justify-center font-bold">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-charcoal-900 truncate">
                          {item.product.name ?? "Product"}
                        </p>
                        <p className="text-xs text-charcoal-300 font-light">
                          {item.size}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-charcoal-900 flex-shrink-0">
                        ৳
                        {((item.product.price ?? 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>

              {/* ── Promo Code ── */}
              <div className="mt-6">
                {!promoResult ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyPromo()
                        }
                        placeholder="Promo code"
                        className="flex-1 px-4 py-2.5 border border-charcoal-200 rounded-xl text-sm text-charcoal-900 placeholder-charcoal-300 bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-200 focus:border-charcoal-400 transition-all font-mono tracking-wider uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                        className="px-5 py-2.5 bg-charcoal-950 text-white text-xs font-semibold rounded-xl hover:bg-charcoal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        {promoLoading ? (
                          <svg
                            className="animate-spin w-4 h-4"
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
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 font-light px-1 flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                          />
                        </svg>
                        {promoError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <svg
                        className="w-4 h-4 text-green-600 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <div>
                        <p className="text-xs font-bold text-green-800 font-mono tracking-wider">
                          {promoResult.code}
                        </p>
                        <p className="text-[11px] text-green-600 font-light mt-0.5">
                          {promoResult.description ||
                            (promoResult.type === "percentage"
                              ? `${promoResult.value}% discount applied`
                              : `৳${promoResult.value} discount applied`)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-green-500 hover:text-red-500 transition-colors p-1"
                      title="Remove"
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
                )}
              </div>

              {/* ── Price breakdown ── */}
              <div className="border-t border-charcoal-100 mt-6 pt-5 space-y-3 text-sm">
                <div className="flex justify-between text-charcoal-500">
                  <span className="font-light">
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}
                    )
                  </span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-charcoal-500">
                  <span className="font-light">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `৳${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {promoResult && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Discount (Promo)</span>
                    <span className="font-semibold">
                      −৳{promoResult.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-charcoal-100 pt-3 flex justify-between font-bold text-charcoal-950">
                  <span>Total</span>
                  <span className="text-base">৳{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security badge */}
              <div className="mt-5 flex items-center gap-2 text-xs text-charcoal-400 justify-center">
                <svg
                  className="w-3.5 h-3.5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <span className="font-light">Secure 256-bit SSL checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DemoMfsGatewayModal
        isOpen={isGatewayOpen}
        method={paymentInfo.method !== "cod" ? paymentInfo.method : ""}
        amount={total}
        onSuccess={(txnId) => {
          setPaymentInfo((prev) => ({ ...prev, txnId }));
          setPaymentErrors((prev) => ({ ...prev, txnId: "" }));
          setIsGatewayOpen(false);
          notifySuccess(`Payment verified! TxnID: ${txnId}`);
          handlePlaceOrder(txnId);
        }}
        onClose={() => setIsGatewayOpen(false)}
      />
    </div>
  );
}
