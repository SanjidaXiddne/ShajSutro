"use client";

import ProductCard from "@/components/product/ProductCard";
import { products as fallbackProducts } from "@/data/products";
import { getApiBase } from "@/lib/apiBase";
import { Product, SortOption } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category:
    | {
        _id: string;
        name: string;
        slug: string;
        parent?: { _id: string; name: string; slug: string } | string;
      }
    | string;
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
}

interface NavSubCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

interface NavCategory {
  _id: string;
  name: string;
  slug: string;
  productCount: number;
  subcategories?: NavSubCategory[];
}

interface ShopProduct extends Product {
  parentCategorySlug?: string;
}

function mapProduct(p: ApiProduct): ShopProduct {
  let catSlug = "";
  let parentSlug: string | undefined = undefined;

  if (typeof p.category === "object" && p.category) {
    catSlug = p.category.slug || "";
    if (p.category.parent && typeof p.category.parent === "object") {
      parentSlug = p.category.parent.slug;
    }
  } else if (typeof p.category === "string") {
    catSlug = p.category;
  }

  return {
    id: p._id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    category: catSlug,
    parentCategorySlug: parentSlug,
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
  };
}

function getProductCategorySlugs(p: ShopProduct, cats: NavCategory[]) {
  const directSlug = (p.category || "").toLowerCase();
  let parentSlug = p.parentCategorySlug
    ? p.parentCategorySlug.toLowerCase()
    : undefined;

  if (!parentSlug) {
    for (const c of cats) {
      if (c.slug.toLowerCase() === directSlug) {
        break;
      }
      if (
        c.subcategories?.some(
          (s) =>
            s.slug.toLowerCase() === directSlug ||
            s._id === directSlug ||
            s.name.toLowerCase() === directSlug,
        )
      ) {
        parentSlug = c.slug.toLowerCase();
        break;
      }
    }
  }

  return { directSlug, parentSlug };
}

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "38",
  "40",
  "42",
  "44",
  "4-6 Yrs",
  "6-8 Yrs",
  "8-10 Yrs",
  "10-12 Yrs",
];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
  { value: "popular", label: "Most Popular" },
];

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-charcoal-200 border-t-charcoal-900 rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

const ITEMS_PER_PAGE = 9;

// ─── Main content ─────────────────────────────────────────────────────────────

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";
  const initialBadge = searchParams.get("badge") ?? "";
  const searchQuery = searchParams.get("search") ?? searchParams.get("q") ?? "";

  // ── Data state ──
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive max price from current products for the range slider
  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 25000;
    const highest = Math.max(...allProducts.map((p) => p.price));
    return Math.max(5000, Math.ceil(highest / 1000) * 1000);
  }, [allProducts]);

  // ── Filter & Pagination state ──
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Reset filters when URL category/badge changes or allProducts load
  useEffect(() => {
    setSelectedCategories(initialCategory ? [initialCategory] : []);
    setSelectedSizes([]);
    setSortBy("newest");
    setCurrentPage(1);
    if (allProducts.length > 0) {
      const highest = Math.max(...allProducts.map((p) => p.price));
      const dynamicMax = Math.max(5000, Math.ceil(highest / 1000) * 1000);
      setPriceRange([0, dynamicMax]);
    }
  }, [initialCategory, initialBadge, searchQuery, allProducts]);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedSizes, priceRange, sortBy, searchQuery]);

  // Fetch categories for the filter panel
  useEffect(() => {
    fetch(`${getApiBase()}/api/categories`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setCategories(j.data);
      })
      .catch(() => {});
  }, []);

  // Fetch products whenever the badge or search URL param changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (initialBadge) params.set("badge", initialBadge);
    if (searchQuery) params.set("search", searchQuery);

    fetch(`${getApiBase()}/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data) && j.data.length > 0) {
          const prods = (j.data as ApiProduct[]).map(mapProduct);
          setAllProducts(prods);
          const highest = Math.max(...prods.map((p) => p.price));
          const dynamicMax = Math.max(5000, Math.ceil(highest / 1000) * 1000);
          setPriceRange([0, dynamicMax]);
        } else {
          setAllProducts(fallbackProducts);
          const highest = Math.max(...fallbackProducts.map((p) => p.price));
          const dynamicMax = Math.max(5000, Math.ceil(highest / 1000) * 1000);
          setPriceRange([0, dynamicMax]);
        }
      })
      .catch(() => {
        setAllProducts(fallbackProducts);
        const highest = Math.max(...fallbackProducts.map((p) => p.price));
        const dynamicMax = Math.max(5000, Math.ceil(highest / 1000) * 1000);
        setPriceRange([0, dynamicMax]);
      })
      .finally(() => setLoading(false));
  }, [initialBadge, searchQuery]);

  // ── Client-side filtering + sorting ──
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }

    if (selectedCategories.length > 0) {
      const selectedLower = selectedCategories.map((c) => c.toLowerCase());
      list = list.filter((p) => {
        const { directSlug, parentSlug } = getProductCategorySlugs(
          p,
          categories,
        );
        return (
          selectedLower.includes(directSlug) ||
          (parentSlug ? selectedLower.includes(parentSlug) : false)
        );
      });
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        list.sort((a, b) => (b.totalOrdered ?? 0) - (a.totalOrdered ?? 0));
        break;
    }

    return list;
  }, [
    allProducts,
    selectedCategories,
    selectedSizes,
    priceRange,
    sortBy,
    categories,
    searchQuery,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const setPriceMin = (min: number) => {
    setPriceRange(([curMin, curMax]) => {
      const nextMin = Math.max(0, Math.min(min, curMax));
      return [nextMin, curMax];
    });
  };

  const setPriceMax = (max: number) => {
    setPriceRange(([curMin, curMax]) => {
      const nextMax = Math.min(maxPrice, Math.max(max, curMin));
      return [curMin, nextMax];
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setPriceRange([0, maxPrice]);
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.length +
    selectedSizes.length +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  // ── Filter panel (shared desktop + mobile) ──
  const FiltersPanel = () => (
    <div className="space-y-7">
      {categories.length > 0 && !initialBadge && (
        <div>
          <h2 className="text-xs font-bold text-emerald-950 mb-3.5 tracking-wider uppercase">
            Categories
          </h2>
          <div className="space-y-2">
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.slug);
              const parentProductCount = allProducts.filter((p) => {
                const { directSlug, parentSlug } = getProductCategorySlugs(
                  p,
                  categories,
                );
                return (
                  directSlug === cat.slug.toLowerCase() ||
                  parentSlug === cat.slug.toLowerCase()
                );
              }).length;

              return (
                <div key={cat._id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border transition-all duration-200 ${
                      isSelected
                        ? "border-emerald-300 bg-emerald-500/10 text-emerald-950 font-semibold shadow-xs"
                        : "border-transparent text-emerald-900/70 hover:border-emerald-100 hover:bg-emerald-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-emerald-950 border-emerald-950 shadow-xs"
                            : "border-emerald-200 bg-white"
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="text-xs font-semibold truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isSelected
                          ? "bg-emerald-950 text-white font-bold"
                          : "bg-emerald-100/50 text-emerald-800"
                      }`}
                    >
                      {parentProductCount}
                    </span>
                  </button>

                  {/* Subcategories (if any) */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="ml-5 pl-2.5 border-l-2 border-emerald-200/60 space-y-1 pt-0.5">
                      {cat.subcategories.map((sub) => {
                        const isSubSelected = selectedCategories.includes(
                          sub.slug,
                        );
                        const subProductCount = allProducts.filter((p) => {
                          const { directSlug } = getProductCategorySlugs(
                            p,
                            categories,
                          );
                          return directSlug === sub.slug.toLowerCase();
                        }).length;

                        return (
                          <button
                            key={sub._id}
                            type="button"
                            onClick={() => toggleCategory(sub.slug)}
                            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 border transition-all duration-200 ${
                              isSubSelected
                                ? "border-emerald-300 bg-emerald-500/15 text-emerald-950 font-bold"
                                : "border-transparent text-emerald-900/70 hover:bg-emerald-50/50 hover:text-emerald-950"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                  isSubSelected
                                    ? "bg-emerald-950 border-emerald-950"
                                    : "border-emerald-200 bg-white"
                                }`}
                              >
                                {isSubSelected && (
                                  <svg
                                    className="w-2 h-2 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3.5}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </span>
                              <span className="text-[11px] font-medium truncate">
                                {sub.name}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                                isSubSelected
                                  ? "bg-emerald-950 text-white font-bold"
                                  : "bg-emerald-100/40 text-emerald-800"
                              }`}
                            >
                              {subProductCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs font-bold text-emerald-950 mb-3.5 tracking-wider uppercase">
          Price Range
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs text-emerald-900/70 font-medium mb-1.5">
              Min Price (৳)
            </label>
            <input
              type="number"
              min={0}
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 bg-white text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-emerald-900/70 font-medium mb-1.5">
              Max Price (৳)
            </label>
            <input
              type="number"
              min={priceRange[0]}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-emerald-200/80 bg-white text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-xs"
            />
          </div>
        </div>

        <div className="relative h-6 flex items-center mt-2 mb-1">
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={50}
            value={priceRange[0]}
            onChange={(e) => setPriceMin(Number(e.target.value))}
            className="absolute w-full accent-emerald-950 h-1 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={50}
            value={priceRange[1]}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="absolute w-full accent-emerald-950 h-1 bg-transparent appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-emerald-900/70 mt-2 font-medium">
          <span>৳0</span>
          <span>৳{maxPrice}</span>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-emerald-950 mb-3.5 tracking-wider uppercase">
          Sizes
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  isSelected
                    ? "bg-emerald-950 text-white border-emerald-950 shadow-xs"
                    : "border-emerald-200/80 bg-white text-emerald-950 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-2 border-t border-emerald-100">
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors flex items-center gap-1"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );

  const getCategoryLabel = (slug: string) => {
    const parent = categories.find(
      (c) => c.slug.toLowerCase() === slug.toLowerCase(),
    );
    if (parent) return parent.name;
    for (const c of categories) {
      const sub = c.subcategories?.find(
        (s) => s.slug.toLowerCase() === slug.toLowerCase(),
      );
      if (sub) return `${c.name} › ${sub.name}`;
    }
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const headingText = useMemo(() => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (initialBadge) return initialBadge;
    if (!initialCategory) return "All Products";
    return getCategoryLabel(initialCategory);
  }, [searchQuery, initialBadge, initialCategory, categories]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5fff9] via-[#eef9f2] to-white relative overflow-x-clip">
      {/* Decorative organic glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[25%] right-[-10%] w-[40%] h-[40%] bg-teal-200/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ─── Simplified Hero Section ─── */}
      <div className="relative overflow-hidden border-b border-emerald-100/50 bg-gradient-to-r from-emerald-50/70 via-emerald-100/40 to-teal-50/50 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-2xl space-y-2 md:space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Curated Collection
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-emerald-950 leading-tight">
                {headingText}
              </h1>
              <span className="text-xs font-semibold text-emerald-800 bg-white/80 border border-emerald-200 px-3 py-1 rounded-full shadow-xs">
                {loading
                  ? "Loading..."
                  : `${filteredProducts.length} ${filteredProducts.length === 1 ? "item" : "items"}`}
              </span>
            </div>
            <p className="text-emerald-900/70 text-xs sm:text-sm font-normal max-w-lg leading-relaxed">
              Explore ShajSutro&apos;s premium lineup of products designed to
              combine style, longevity, and exceptional quality checks.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex gap-8 items-start">
          {/* Glassmorphic Filters Sidebar (Desktop - Fixed/Sticky on scroll) */}
          <aside className="hidden lg:block w-64 flex-shrink-0 self-start sticky top-24 z-20">
            <div className="bg-white/85 backdrop-blur-md border border-emerald-100/90 rounded-2xl p-5 shadow-xs max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain">
              <FiltersPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Sorting & mobile layout controls */}
            <div className="flex items-center justify-between gap-4 mb-8 bg-white/40 backdrop-blur-md border border-emerald-100/50 rounded-2xl p-4 shadow-soft">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="flex lg:hidden items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-950 border border-emerald-200/80 bg-white/90 px-4 py-2.5 rounded-xl hover:bg-white transition-all shadow-xs"
              >
                <svg
                  className="w-4 h-4 text-emerald-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                  />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className="w-4 h-4 rounded-full bg-emerald-950 text-white text-[10px] flex items-center justify-center font-bold">
                    {Math.min(9, activeFiltersCount)}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-900/70 hidden sm:block">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm font-medium border border-emerald-200/80 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 bg-white text-emerald-950 shadow-xs cursor-pointer hover:border-emerald-300 transition-all"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Micro-animated Active Filter Chips (Standardized unified pill style) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-in">
                <span className="text-xs text-emerald-900/70 font-medium mr-1 uppercase tracking-wider">
                  Active:
                </span>
                {searchQuery && (
                  <Link
                    href={`/shop${initialCategory ? `?category=${initialCategory}` : ""}${initialBadge ? `${initialCategory ? "&" : "?"}badge=${initialBadge}` : ""}`}
                    className="group flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-emerald-800 shadow-xs"
                  >
                    <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      <svg
                        className="w-2.5 h-2.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  </Link>
                )}
                {selectedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="group flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-emerald-800 shadow-xs"
                  >
                    <span>{getCategoryLabel(cat)}</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      <svg
                        className="w-2.5 h-2.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  </button>
                ))}
                {selectedSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className="group flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-emerald-800 shadow-xs"
                  >
                    <span>{size}</span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      <svg
                        className="w-2.5 h-2.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  </button>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <button
                    type="button"
                    onClick={() => setPriceRange([0, maxPrice])}
                    className="group flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-emerald-800 shadow-xs"
                  >
                    <span>
                      ৳{priceRange[0]} – ৳{priceRange[1]}
                    </span>
                    <span className="bg-white/20 rounded-full p-0.5 group-hover:bg-white/30 transition-colors">
                      <svg
                        className="w-2.5 h-2.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-emerald-800 hover:text-emerald-950 hover:underline font-semibold ml-2 transition-all"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Products / Loading / Empty Grids */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 sm:gap-x-7">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-emerald-100/40 to-emerald-50/20 animate-pulse border border-emerald-100/30" />
                    <div className="h-4 bg-emerald-100/40 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-emerald-100/30 rounded animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 backdrop-blur-md border border-emerald-100/40 rounded-3xl p-8 shadow-glass mt-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100/30 border border-emerald-200/50 flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-emerald-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-emerald-950">
                  No products match your criteria
                </h3>
                <p className="text-emerald-900/70 mt-2 text-sm font-normal max-w-sm leading-relaxed">
                  Try resetting the price range, unselecting size filters, or
                  exploring other categories.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-8 px-6 py-3 min-h-[44px] bg-emerald-950 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 transition-all shadow-sm active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 sm:gap-x-7">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* ─── Numbered Pagination Controls (9 items per page) ─── */}
                {totalPages > 1 && (
                  <div className="mt-12 pt-6 border-t border-emerald-100/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-emerald-900/70 font-medium">
                      Showing{" "}
                      <span className="font-bold text-emerald-950">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>
                      –
                      <span className="font-bold text-emerald-950">
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          filteredProducts.length,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-emerald-950">
                        {filteredProducts.length}
                      </span>{" "}
                      items
                    </p>

                    <div className="flex items-center gap-1.5">
                      {/* Previous Page Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 150, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-emerald-200/80 bg-white text-emerald-950 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1"
                        aria-label="Previous Page"
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
                        Prev
                      </button>

                      {/* Numbered Page Buttons */}
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 150, behavior: "smooth" });
                            }}
                            className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                              currentPage === pageNum
                                ? "bg-emerald-950 text-white shadow-xs"
                                : "border border-emerald-200/80 bg-white text-emerald-950 hover:bg-emerald-50"
                            }`}
                            aria-label={`Go to page ${pageNum}`}
                            aria-current={
                              currentPage === pageNum ? "page" : undefined
                            }
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      {/* Next Page Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 150, behavior: "smooth" });
                        }}
                        disabled={currentPage === totalPages}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-emerald-200/80 bg-white text-emerald-950 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1"
                        aria-label="Next Page"
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
            )}
          </div>
        </div>
      </div>

      {/* Upgraded Mobile Drawer */}
      {isMobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-emerald-950/30 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-[#f5fff9] to-white flex flex-col shadow-soft-xl border-r border-emerald-100/50 animate-slide-in">
            <div className="flex items-center justify-between px-7 py-6 border-b border-emerald-100/30">
              <h2 className="text-base font-semibold text-emerald-950 uppercase tracking-wider">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 text-emerald-800/70 hover:text-emerald-950 rounded-full transition-colors duration-200"
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
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-7 py-7">
              <FiltersPanel />
            </div>
            <div className="px-7 py-5 border-t border-emerald-100/30 bg-white/40 backdrop-blur-md">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="flex-1 min-h-[44px] rounded-xl border border-emerald-200 bg-white text-emerald-950 hover:bg-emerald-50 py-3 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 min-h-[44px] rounded-xl bg-emerald-950 text-white hover:bg-emerald-800 py-3 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
                >
                  Apply ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
