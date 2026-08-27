import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { AppError } from "../middleware/error.middleware";
import Category from "../models/Category";
import Product from "../models/Product";
import { ICategoryDocument } from "../types";

// ─── GET /api/products ────────────────────────────────────────────────────────

export const getProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      ids,
      category,
      badge,
      isFeatured,
      minPrice,
      maxPrice,
      inStock,
      search,
      sort = "-createdAt",
      page = "1",
      limit = "12",
    } = req.query as Record<string, string | undefined>;

    const filter: Record<string, unknown> = { isVisible: { $ne: false } };

    if (ids) {
      const list = ids
        .split(",")
        .map((s) => s.trim())
        .filter((s) => mongoose.Types.ObjectId.isValid(s));
      filter._id = { $in: list.map((s) => new mongoose.Types.ObjectId(s)) };
    }

    if (category) {
      let targetCat = null;
      if (mongoose.Types.ObjectId.isValid(category)) {
        targetCat = await Category.findById(category);
      } else {
        targetCat = await Category.findOne({ slug: category });
      }

      if (targetCat) {
        const childCats = await Category.find({ parent: targetCat._id });
        if (childCats.length > 0) {
          filter.category = {
            $in: [
              targetCat._id,
              ...childCats.map((c: ICategoryDocument) => c._id),
            ],
          };
        } else {
          filter.category = targetCat._id;
        }
      } else {
        filter.category = mongoose.Types.ObjectId.isValid(category)
          ? new mongoose.Types.ObjectId(category)
          : new mongoose.Types.ObjectId();
      }
    }
    if (badge) filter.badge = badge;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (inStock !== undefined) filter.inStock = inStock === "true";

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice)
        (filter.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice)
        (filter.price as Record<string, number>).$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const escaped = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matchingCategories = await Category.find({
        name: { $regex: escaped, $options: "i" },
      }).select("_id");
      const matchedCatIds = matchingCategories.map((c) => c._id);

      filter.$or = [
        { sku: { $regex: escaped, $options: "i" } },
        { name: { $regex: escaped, $options: "i" } },
        { tags: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        ...(matchedCatIds.length > 0
          ? [{ category: { $in: matchedCatIds } }]
          : []),
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit ?? "12"));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate({
          path: "category",
          select: "name slug parent",
          populate: { path: "parent", select: "name slug" },
        })
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  },
);

// ─── GET /api/products/:id ────────────────────────────────────────────────────

export const getProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.id).populate({
      path: "category",
      select: "name slug parent",
      populate: { path: "parent", select: "name slug" },
    });
    if (!product) throw new AppError("Product not found", 404);

    res.status(200).json({
      success: true,
      data: product,
    });
  },
);

// ─── POST /api/products (admin) ───────────────────────────────────────────────

export const createProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      images,
      sizes,
      colors,
      badge,
      inStock,
      isFeatured,
      isVisible,
      stock,
      tags,
      sku,
    } = req.body as {
      name: string;
      description: string;
      price: number;
      originalPrice?: number;
      category: string;
      images?: string[];
      sizes?: string[];
      colors?: string[];
      badge?: "New" | "Sale" | "Best Seller";
      inStock?: boolean;
      isFeatured?: boolean;
      isVisible?: boolean;
      stock?: number;
      tags?: string[];
      sku?: string;
    };

    if (!name || !description || !price || !category) {
      throw new AppError(
        "Name, description, price, and category are required",
        400,
      );
    }

    const slug =
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "") +
      "-" +
      Date.now();

    const generateSku = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const part = (len: number) =>
        Array.from({ length: len }, () =>
          chars.charAt(Math.floor(Math.random() * chars.length)),
        ).join("");
      return `OY-${part(4)}-${part(4)}-${Math.floor(1000 + Math.random() * 9000)}`;
    };

    const finalSku = sku && sku.trim() ? sku.trim().toUpperCase() : generateSku();

    const product = await Product.create({
      name,
      slug,
      sku: finalSku,
      description,
      price,
      originalPrice,
      category,
      images: images ?? [],
      sizes: sizes ?? [],
      colors: colors ?? [],
      badge: badge || undefined,
      inStock: inStock ?? true,
      isFeatured: isFeatured ?? false,
      isVisible: isVisible ?? true,
      stock: stock ?? 0,
      tags: tags ?? [],
    });

    const populated = await product.populate({
      path: "category",
      select: "name slug parent",
      populate: { path: "parent", select: "name slug" },
    });

    res.status(201).json({
      success: true,
      message: "Product created",
      data: populated,
    });
  },
);

// ─── PUT /api/products/:id (admin) ────────────────────────────────────────────

export const updateProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const updates = req.body as Partial<{
      name: string;
      sku: string;
      description: string;
      price: number;
      originalPrice: number;
      category: string;
      images: string[];
      sizes: string[];
      colors: string[];
      badge: string | null;
      inStock: boolean;
      isFeatured: boolean;
      isVisible: boolean;
      stock: number;
      tags: string[];
    }>;

    if (updates.sku !== undefined) {
      updates.sku = updates.sku ? updates.sku.trim().toUpperCase() : undefined;
    }

    if (updates.name) {
      (updates as Record<string, unknown>).slug =
        updates.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "") +
          "-" +
          Date.now();
    }

    if (updates.badge === "" || updates.badge === null) {
      updates.badge = null;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate({
      path: "category",
      select: "name slug parent",
      populate: { path: "parent", select: "name slug" },
    });

    if (!product) throw new AppError("Product not found", 404);

    res.status(200).json({
      success: true,
      message: "Product updated",
      data: product,
    });
  },
);

// ─── DELETE /api/products/:id (admin) ─────────────────────────────────────────

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError("Product not found", 404);

    await product.deleteOne();
    res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  },
);
