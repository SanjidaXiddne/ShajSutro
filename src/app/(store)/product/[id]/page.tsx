"use client";

import ProductGrid from "@/components/product/ProductGrid";
import { products as fallbackProducts } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { getApiBase } from "@/lib/apiBase";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getColorHex } from "@/lib/colors";

import { notifyError, notifySuccess } from "@/lib/notify";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: { _id: string; name: string; slug: string } | string;
  images: string[];
  sizes: string[];
  colors: string[];
  badge?: "New" | "Sale" | "Best Seller";
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock?: number;
  totalOrdered?: number;
  tags?: string[];
  sku?: string;
}

interface ProductReviewItem {
  _id: string;
  user?: { name?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

function mapProduct(p: ApiProduct): Product {
  const catSlug = typeof p.category === "object" ? p.category.slug : p.category;
  return {
    id: p._id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    category: catSlug,
    images: p.images,
    sizes: p.sizes,
    colors: p.colors,
    badge: p.badge,
    description: p.description,
    rating: p.rating,
    reviews: p.reviews,
    inStock: p.inStock,
    stock: p.stock,
    totalOrdered: p.totalOrdered,
    tags: p.tags,
    sku: p.sku,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Dynamic reviews state
  const [dbReviews, setDbReviews] = useState<ProductReviewItem[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canUserReview, setCanUserReview] = useState(false);
  const [userDeliveredOrderId, setUserDeliveredOrderId] = useState("");

  const checkPurchaseStatus = (productId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setCanUserReview(false);
      return;
    }

    fetch(`${getApiBase()}/api/orders?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          const matchingOrder = j.data.find((ord: any) => {
            const isDelivered = ord.status === "delivered";
            const hasProduct = ord.items?.some((item: any) => {
              const pId = typeof item.product === "object" ? item.product?._id : item.product;
              return String(pId) === String(productId);
            });
            return isDelivered && hasProduct;
          });

          if (matchingOrder) {
            setCanUserReview(true);
            setUserDeliveredOrderId(matchingOrder._id);
            setOrderIdInput(matchingOrder._id);
          } else {
            setCanUserReview(false);
          }
        }
      })
      .catch(() => setCanUserReview(false));
  };

  const fetchDynamicReviews = (productId: string) => {
    fetch(`${getApiBase()}/api/reviews/product/${productId}`)
      .then((r) => r.json())
      .then((rj) => {
        if (rj.success && Array.isArray(rj.data) && rj.data.length > 0) {
          const revs: ProductReviewItem[] = rj.data;
          setDbReviews(revs);
          const count = revs.length;
          const avg =
            Math.round(
              (revs.reduce((sum, r) => sum + r.rating, 0) / count) * 10,
            ) / 10;
          setProduct((prev) =>
            prev ? { ...prev, rating: avg, reviews: count } : prev,
          );
        }
      })
      .catch(() => {});
  };

  // Fetch product
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${getApiBase()}/api/products/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.success || !j.data) {
          const fb = fallbackProducts.find((p) => p.id === id) || fallbackProducts[0];
          setProduct(fb);
          setSelectedSize(fb.sizes[0] ?? "");
          setSelectedColor(fb.colors[0] ?? "");
          setRelated(fallbackProducts.filter((rp) => rp.id !== fb.id).slice(0, 4));
          return;
        }
        const p = mapProduct(j.data as ApiProduct);
        setProduct(p);
        setSelectedSize(p.sizes[0] ?? "");
        setSelectedColor(p.colors[0] ?? "");
        fetchDynamicReviews(p.id);
        checkPurchaseStatus(p.id);

        // Fetch related
        return fetch(
          `${getApiBase()}/api/products?category=${p.category}&limit=4`,
        )
          .then((r) => r.json())
          .then((rj) => {
            if (rj.success && rj.data && rj.data.length > 0) {
              setRelated(
                (rj.data as ApiProduct[])
                  .map(mapProduct)
                  .filter((rp) => rp.id !== p.id)
                  .slice(0, 4),
              );
            } else {
              setRelated(fallbackProducts.filter((rp) => rp.id !== p.id).slice(0, 4));
            }
          });
      })
      .catch(() => {
        const fb = fallbackProducts.find((p) => p.id === id) || fallbackProducts[0];
        setProduct(fb);
        setSelectedSize(fb.sizes[0] ?? "");
        setSelectedColor(fb.colors[0] ?? "");
        setRelated(fallbackProducts.filter((rp) => rp.id !== fb.id).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      notifyError("Please log in to submit a review.");
      router.push("/login");
      return;
    }
    if (!orderIdInput.trim()) {
      notifyError("Please provide your delivered Order ID.");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`${getApiBase()}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: id,
          orderId: orderIdInput.trim(),
          rating: newRating,
          comment: newComment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      notifySuccess("Thank you! Your review has been submitted and published.");
      setShowReviewForm(false);
      setNewComment("");
      setOrderIdInput("");
      fetchDynamicReviews(id);
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : "Review submission failed");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    addItem(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => {
      setAdding(false);
      setAdded(false);
    }, 1500);
  };

  const discount =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100,
        )
      : null;

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-3xl bg-charcoal-100 animate-pulse" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-charcoal-100 animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-5 pt-4">
              <div className="h-8 bg-charcoal-100 rounded animate-pulse w-3/4" />
              <div className="h-5 bg-charcoal-100 rounded animate-pulse w-1/3" />
              <div className="h-10 bg-charcoal-100 rounded animate-pulse w-1/4" />
              <div className="h-32 bg-charcoal-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">
        <h1 className="text-2xl font-semibold text-charcoal-900">
          Product Not Found
        </h1>
        <p className="text-charcoal-400 text-sm">
          This product may have been removed or does not exist.
        </p>
        <button onClick={() => router.push("/shop")} className="btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-charcoal-100 bg-warm-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm text-charcoal-400">
            <Link
              href="/"
              className="hover:text-charcoal-900 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/shop"
              className="hover:text-charcoal-900 transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <Link
              href={`/shop?category=${product.category}`}
              className="hover:text-charcoal-900 transition-colors capitalize"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-charcoal-700 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* ── Left: Images ── */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-warm-50 shadow-soft">
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-charcoal-300">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
              )}

              {product.badge && (
                <div className="absolute top-5 left-5">
                  <span
                    className={`px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase rounded-full ${
                      product.badge === "New"
                        ? "bg-accent-600/90 text-white"
                        : product.badge === "Sale"
                          ? "bg-red-500/90 text-white"
                          : "bg-warm-500/90 text-white"
                    }`}
                  >
                    {product.badge === "Sale" && discount
                      ? `-${discount}%`
                      : product.badge}
                  </span>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === i
                        ? "border-charcoal-900 shadow-soft"
                        : "border-transparent hover:border-charcoal-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div className="flex flex-col gap-6 pt-2">
            {/* Name + rating */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-charcoal-400">
                  {product.category}
                </p>
                {product.sku && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-charcoal-50 text-charcoal-700 border border-charcoal-200/80 shadow-xs">
                    <span className="text-charcoal-400 font-sans text-[10px] font-bold uppercase tracking-wider">SKU:</span>
                    <span>{product.sku}</span>
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-semibold text-charcoal-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(product.rating) ? "text-warm-500" : "text-charcoal-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-charcoal-400">
                  {product.rating.toFixed(1)} ({product.reviews} reviews)
                </span>
                {product.totalOrdered !== undefined &&
                  product.totalOrdered > 0 && (
                    <span className="text-sm text-charcoal-400">
                      ·{" "}
                      {product.totalOrdered >= 1000
                        ? `${(product.totalOrdered / 1000).toFixed(1)}k`
                        : product.totalOrdered}
                      + ordered
                    </span>
                  )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-charcoal-950">
                ৳{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-charcoal-300 line-through">
                    ৳{product.originalPrice}
                  </span>
                  {discount && discount > 0 && (
                    <span className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                      {discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Stock */}
            <div>
              {!product.inStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Out of stock
                </span>
              ) : product.stock !== undefined &&
                product.stock <= 3 &&
                product.stock > 0 ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Only {product.stock} left in stock
                </span>
              ) : product.stock !== undefined && product.stock <= 10 ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {product.stock} in stock — order soon
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  In stock
                </span>
              )}
            </div>

            <hr className="border-charcoal-100" />

            {/* Size selector */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-xs sm:text-sm font-semibold text-charcoal-900">
                    Size
                  </h2>
                  {selectedSize && (
                    <span className="text-xs text-charcoal-500 font-medium">
                      {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        selectedSize === size
                          ? "bg-emerald-950 text-white border-emerald-950 shadow-xs"
                          : "border-charcoal-200 bg-white text-charcoal-700 hover:border-charcoal-400 hover:bg-charcoal-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-xs sm:text-sm font-semibold text-charcoal-900">
                    Color
                  </h2>
                  {selectedColor && (
                    <span className="text-xs text-charcoal-500 font-medium">
                      {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => {
                    const hex = getColorHex(color);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`relative w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 shadow-xs border ${
                          isSelected
                            ? "ring-2 ring-charcoal-950 ring-offset-2 scale-110 border-charcoal-950"
                            : "border-black/15 hover:border-charcoal-400"
                        }`}
                        style={{
                          backgroundColor: hex,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock || adding}
              className={`w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 ${
                !product.inStock
                  ? "bg-charcoal-100 text-charcoal-400 cursor-not-allowed border border-charcoal-200"
                  : added
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-950 text-white hover:bg-emerald-900 active:scale-[0.98]"
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
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
                  Added to Cart
                </span>
              ) : !product.inStock ? (
                "Out of Stock"
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            {/* Description */}
            {product.description && (
              <div className="pt-2">
                <h2 className="text-xs sm:text-sm font-semibold text-charcoal-900 mb-1.5">
                  Description
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed font-light">
                  {product.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium text-charcoal-600 bg-warm-50 border border-charcoal-100 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Customer Reviews Section */}
            <div className="pt-6 border-t border-charcoal-100 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
                    Customer Reviews
                  </h2>
                  <p className="text-xs text-charcoal-400 mt-0.5 font-light">
                    {product.reviews} verified review{product.reviews !== 1 ? "s" : ""} · {product.rating.toFixed(1)} out of 5 stars
                  </p>
                </div>
                {canUserReview && (
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    {showReviewForm ? "Close Form" : "Write a Review"}
                  </button>
                )}
              </div>

              {!canUserReview && (
                <div>
                </div>
              )}

              {/* Review Submission Form (Only accessible for verified buyers) */}
              {canUserReview && showReviewForm && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Submit Verified Purchase Review
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Verified Buyer
                    </span>
                  </div>

                  {userDeliveredOrderId ? (
                    <div className="text-xs text-charcoal-600 bg-white/80 p-2.5 rounded-xl border border-emerald-100 font-medium">
                      Order: <span className="font-mono text-emerald-800">#{userDeliveredOrderId}</span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Delivered Order ID *
                      </label>
                      <input
                        type="text"
                        value={orderIdInput}
                        onChange={(e) => setOrderIdInput(e.target.value)}
                        placeholder="e.g. 64aef..."
                        required
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-charcoal-200 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Your Rating (1 to 5 Stars) *
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 text-amber-400 hover:scale-125 transition-transform"
                        >
                          <svg
                            className={`w-5 h-5 ${star <= newRating ? "fill-amber-400" : "fill-charcoal-200 text-charcoal-200"}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Review Comment
                    </label>
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tell other shoppers about your experience with this product..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-charcoal-200 focus:outline-none focus:border-emerald-500 font-light"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    {submittingReview ? "Publishing Review..." : "Submit Review"}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              {dbReviews.length === 0 ? (
                <p className="text-xs text-charcoal-400 font-light italic py-2">
                </p>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {dbReviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 rounded-2xl bg-charcoal-50/60 border border-charcoal-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {rev.user?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-charcoal-900 leading-none">
                              {rev.user?.name || "Verified Customer"}
                            </p>
                            <div className="flex items-center gap-0.5 text-amber-500 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${i < rev.rating ? "fill-current" : "text-charcoal-200 fill-charcoal-200"}`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-charcoal-400 font-medium">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-charcoal-600 font-light leading-relaxed pl-9">
                          &quot;{rev.comment}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-charcoal-100">
            <div className="mb-10">
              <span className="text-xs font-semibold text-emerald-800 tracking-wide block mb-1.5">You May Also Like</span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-charcoal-950 tracking-tight">Related Products</h2>
            </div>
            <ProductGrid products={related} columns={4} />
          </div>
        )}
      </div>
    </div>
  );
}
