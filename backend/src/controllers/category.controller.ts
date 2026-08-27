import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AppError } from "../middleware/error.middleware";
import Category from "../models/Category";
import Product from "../models/Product";

// ─── GET /api/categories ──────────────────────────────────────────────────────
// Returns only root (top-level) categories with their product count.

export const getCategories = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const categories = await Category.find({ parent: null });

    // Custom sort: Mens first, then Womens, then Kids
    const categoryOrder = ["mens", "womens", "kids"];
    categories.sort((a, b) => {
      const idxA = categoryOrder.indexOf(a.slug);
      const idxB = categoryOrder.indexOf(b.slug);
      if (idxA === -1 && idxB === -1) return a.name.localeCompare(b.name);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    // fetch all subcategories for these root categories in one query
    const rootIds = categories.map((c) => c._id);
    const allSubs = await Category.find({ parent: { $in: rootIds } }).sort({ name: 1 });
    const subsMap = new Map<string, typeof allSubs>();
    for (const sub of allSubs) {
      const key = String(sub.parent);
      if (!subsMap.has(key)) subsMap.set(key, []);
      subsMap.get(key)!.push(sub);
    }

    const counts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      counts.map((c) => [String(c._id), c.count as number]),
    );

    const data = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap.get(String(cat._id)) ?? 0,
      subcategories: (subsMap.get(String(cat._id)) ?? []).map((s) => ({
        _id: s._id,
        name: s.name,
        slug: s.slug,
        image: s.image,
      })),
    }));

    res.status(200).json({ success: true, data });
  },
);

// ─── GET /api/categories/:id/subcategories ────────────────────────────────────

export const getSubcategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const parent = await Category.findById(req.params.id);
    if (!parent) throw new AppError("Category not found", 404);

    const subcategories = await Category.find({ parent: parent._id }).sort({ name: 1 });

    const counts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      counts.map((c) => [String(c._id), c.count as number]),
    );

    const data = subcategories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap.get(String(cat._id)) ?? 0,
    }));

    res.status(200).json({ success: true, data });
  },
);

// ─── GET /api/categories/:slug ────────────────────────────────────────────────

export const getCategoryBySlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) throw new AppError("Category not found", 404);

    const products = await Product.find({ category: category._id }).populate(
      "category",
      "name slug",
    );

    res.status(200).json({
      success: true,
      data: { category, products },
    });
  },
);

// ─── POST /api/categories (admin) ─────────────────────────────────────────────

export const createCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, description, image, parent } = req.body as {
      name: string;
      description?: string;
      image?: string;
      parent?: string;
    };

    if (!name) throw new AppError("Category name is required", 400);

    let baseSlug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    if (parent) {
      const parentDoc = await Category.findById(parent);
      if (!parentDoc) throw new AppError("Parent category not found", 404);
      baseSlug = `${parentDoc.slug}-${baseSlug}`;
    }

    const category = await Category.create({
      name,
      slug: baseSlug,
      description,
      image,
      parent: parent ?? null,
    });

    res.status(201).json({
      success: true,
      message: "Category created",
      data: category,
    });
  },
);

// ─── PUT /api/categories/:id (admin) ──────────────────────────────────────────

export const updateCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, description, image } = req.body as {
      name?: string;
      description?: string;
      image?: string;
    };

    const existing = await Category.findById(req.params.id);
    if (!existing) throw new AppError("Category not found", 404);

    const updateData: Record<string, string | null | undefined> = { description, image };

    if (name) {
      updateData.name = name;
      let baseSlug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      if (existing.parent) {
        const parentDoc = await Category.findById(existing.parent);
        if (parentDoc) baseSlug = `${parentDoc.slug}-${baseSlug}`;
      }
      updateData.slug = baseSlug;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Category updated",
      data: category,
    });
  },
);

// ─── DELETE /api/categories/:id (admin) ───────────────────────────────────────

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new AppError("Category not found", 404);

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category with ${productCount} associated products`,
        400,
      );
    }

    const subCount = await Category.countDocuments({ parent: category._id });
    if (subCount > 0) {
      throw new AppError(
        `Cannot delete category with ${subCount} subcategories. Delete subcategories first.`,
        400,
      );
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted" });
  },
);
