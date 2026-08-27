"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

type CategoryForm = { name: string; description: string; image: string };
const EMPTY_FORM: CategoryForm = { name: "", description: "", image: "" };

// â”€â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
    >
      {type === "success" ? (
        <svg
          className="w-4 h-4 flex-shrink-0"
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
          className="w-4 h-4 flex-shrink-0"
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

// â”€â”€â”€ Category Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CategoryModal({
  category,
  parentName,
  onClose,
  onSave,
}: {
  category: Category | null;
  parentName?: string;
  onClose: () => void;
  onSave: (data: CategoryForm, id?: string) => Promise<void>;
}) {
  const [form, setForm] = useState<CategoryForm>(() =>
    category
      ? {
          name: category.name,
          description: category.description ?? "",
          image: category.image ?? "",
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form, category?._id);
    } finally {
      setSaving(false);
    }
  };

  const isSubcategory = !!parentName;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="rounded-3xl w-full max-w-md overflow-hidden"
        style={{
          background: "rgba(15,15,25,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
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
              {category
                ? `Edit ${isSubcategory ? "Sub-category" : "Category"}`
                : `New ${isSubcategory ? "Sub-category" : "Category"}`}
            </h2>
            {parentName && (
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                Under:{" "}
                <span className="font-semibold" style={{ color: "#a78bfa" }}>
                  {parentName}
                </span>
              </p>
            )}
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

        <form onSubmit={submit} className="px-7 py-5 space-y-4">
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              Name *
            </label>
            <input
              name="name"
              required
              value={form.name}
              onChange={set}
              placeholder="e.g. T-Shirts"
              className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f1f5f9",
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={set}
              placeholder="Brief description..."
              className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none resize-none admin-dark-input"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f1f5f9",
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              Image URL
            </label>
            <input
              name="image"
              type="url"
              value={form.image}
              onChange={set}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none admin-dark-input"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f1f5f9",
              }}
            />
            {form.image && (
              <div
                className="mt-2 w-16 h-16 rounded-xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 rounded-2xl text-sm font-semibold transition-colors"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(226,232,240,0.7)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && (
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
              )}
              {category ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// â”€â”€â”€ Delete Confirm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DeleteConfirm({
  name,
  deleting,
  onCancel,
  onConfirm,
}: {
  name: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="rounded-3xl w-full max-w-sm p-8"
        style={{
          background: "rgba(15,15,25,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: "rgba(248,113,113,0.12)",
            border: "1px solid rgba(248,113,113,0.2)",
          }}
        >
          <svg
            className="w-7 h-7 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: "#e2e8f0" }}>
          Delete?
        </h3>
        <p className="text-sm mb-1" style={{ color: "rgba(148,163,184,0.6)" }}>
          Delete{" "}
          <span className="font-semibold" style={{ color: "#e2e8f0" }}>
            {name}
          </span>
          ?
        </p>
        <p className="text-xs mb-7" style={{ color: "rgba(148,163,184,0.5)" }}>
          Cannot delete if it has products or subcategories.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-5 py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting && (
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
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Category Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CategoryCard({
  cat,
  showSubBtn,
  onEdit,
  onDelete,
  onManageSub,
  onManageProducts,
}: {
  cat: Category;
  showSubBtn: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onManageSub?: () => void;
  onManageProducts?: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 bg-white/[0.03] border border-white/10 shadow-lg flex flex-col justify-between">
      <div>
        <div className="h-36 relative overflow-hidden bg-gradient-to-br from-violet-950/40 via-slate-900 to-indigo-950/30">
          {cat.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-100 truncate" title={cat.name}>
              {cat.name}
            </h2>
            {cat.productCount !== undefined && (
              <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md shrink-0">
                {cat.productCount} items
              </span>
            )}
          </div>
          <p className="text-[11px] font-mono text-violet-400/80 truncate">
            /{cat.slug}
          </p>
          {cat.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1" title={cat.description}>
              {cat.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-4 pt-0 space-y-2">
        {showSubBtn ? (
          <button
            type="button"
            onClick={onManageSub}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 shadow-xs whitespace-nowrap"
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
                d="M4 6h16M4 12h10M4 18h7"
              />
            </svg>
            Sub-categories
          </button>
        ) : (
          <button
            type="button"
            onClick={onManageProducts}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 shadow-xs whitespace-nowrap"
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
                strokeWidth={1.5}
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
            View Products
          </button>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit category ${cat.name}`}
            className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete category ${cat.name}`}
            className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CategoriesContent() {
  const { apiFetch } = useAdminAuth();
  const router = useRouter();

  // root categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // selected parent for sub-category drill-down
  const [selectedParent, setSelectedParent] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // modal & delete state
  const [modal, setModal] = useState<Category | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // â”€â”€ Fetch root categories â”€â”€
  const fetchCategories = useCallback(async () => {
    setLoadingCats(true);
    try {
      const res = await apiFetch<{ success: boolean; data: Category[] }>(
        "/categories",
      );
      setCategories(res.data);
    } catch (e: unknown) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to load categories",
      );
    } finally {
      setLoadingCats(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // â”€â”€ Fetch subcategories when a parent is selected â”€â”€
  const fetchSubcategories = useCallback(
    async (parentId: string) => {
      setLoadingSubs(true);
      try {
        const res = await apiFetch<{ success: boolean; data: Category[] }>(
          `/categories/${parentId}/subcategories`,
        );
        setSubcategories(res.data);
      } catch (e: unknown) {
        showToast(
          "error",
          e instanceof Error ? e.message : "Failed to load sub-categories",
        );
      } finally {
        setLoadingSubs(false);
      }
    },
    [apiFetch],
  );

  const openSubPanel = (cat: Category) => {
    setSelectedParent(cat);
    fetchSubcategories(cat._id);
  };

  const closeSubPanel = () => {
    setSelectedParent(null);
    setSubcategories([]);
    setModal(null);
  };

  // â”€â”€ Save (create / update) â”€â”€
  const handleSave = async (data: CategoryForm, id?: string) => {
    try {
      if (id) {
        await apiFetch(`/categories/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        showToast("success", "Updated");
      } else {
        const body = selectedParent
          ? { ...data, parent: selectedParent._id }
          : data;
        await apiFetch("/categories", {
          method: "POST",
          body: JSON.stringify(body),
        });
        showToast("success", "Created");
      }
      setModal(null);
      if (selectedParent) fetchSubcategories(selectedParent._id);
      else fetchCategories();
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Save failed");
      throw e;
    }
  };

  // â”€â”€ Delete â”€â”€
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/categories/${deleteTarget._id}`, { method: "DELETE" });
      showToast("success", "Deleted");
      setDeleteTarget(null);
      if (selectedParent) fetchSubcategories(selectedParent._id);
      else fetchCategories();
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const isSubView = !!selectedParent;
  const activeList = isSubView ? subcategories : categories;
  const activeLoading = isSubView ? loadingSubs : loadingCats;

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isSubView && (
            <button
              onClick={closeSubPanel}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Categories
            </button>
          )}
          {isSubView && <span className="text-slate-600">/</span>}
          <div>
            {isSubView ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">
                  {selectedParent.name}
                </span>
                <span className="text-slate-600">&gt;</span>
                <span>Sub-categories</span>
              </div>
            ) : null}
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {activeList.length} {isSubView ? "sub-categor" : "categor"}
              {activeList.length !== 1 ? "ies" : "y"} in catalog
            </p>
          </div>
        </div>

        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-violet-700 hover:to-indigo-700 transition-all hover:shadow-lg hover:shadow-violet-300/40 hover:-translate-y-0.5"
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
              strokeWidth={2.5}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {isSubView ? "Add Sub-category" : "Add Category"}
        </button>
      </div>

      {/* Grid */}
      {activeLoading ? (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              borderTopColor: "#7c3aed",
            }}
          />
        </div>
      ) : activeList.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24"
          style={{ color: "rgba(148,163,184,0.4)" }}
        >
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
              d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
            />
          </svg>
          <p className="text-sm font-medium">
            No {isSubView ? "sub-categories" : "categories"} yet
          </p>
          <button
            onClick={() => setModal("new")}
            className="mt-3 text-sm hover:underline font-bold"
            style={{ color: "#a78bfa" }}
          >
            Create {isSubView ? "first sub-category" : "first category"} â†’
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeList.map((cat) => (
            <CategoryCard
              key={cat._id}
              cat={cat}
              showSubBtn={!isSubView}
              onEdit={() => setModal(cat)}
              onDelete={() => setDeleteTarget(cat)}
              onManageSub={() => openSubPanel(cat)}
              onManageProducts={() =>
                router.push(
                  `/admin/products?category=${cat._id}&categoryName=${encodeURIComponent(cat.name)}`,
                )
              }
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal !== null && (
        <CategoryModal
          category={modal === "new" ? null : modal}
          parentName={isSubView ? selectedParent?.name : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <AdminAuthGuard>
      <CategoriesContent />
    </AdminAuthGuard>
  );
}
