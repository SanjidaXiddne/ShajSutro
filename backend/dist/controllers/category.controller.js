"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryBySlug = exports.getSubcategories = exports.getCategories = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const error_middleware_1 = require("../middleware/error.middleware");
const Category_1 = __importDefault(require("../models/Category"));
const Product_1 = __importDefault(require("../models/Product"));
// ─── GET /api/categories ──────────────────────────────────────────────────────
// Returns only root (top-level) categories with their product count.
exports.getCategories = (0, express_async_handler_1.default)(async (_req, res) => {
    const categories = await Category_1.default.find({ parent: null });
    // Custom sort: Mens first, then Womens, then Kids
    const categoryOrder = ["mens", "womens", "kids"];
    categories.sort((a, b) => {
        const idxA = categoryOrder.indexOf(a.slug);
        const idxB = categoryOrder.indexOf(b.slug);
        if (idxA === -1 && idxB === -1)
            return a.name.localeCompare(b.name);
        if (idxA === -1)
            return 1;
        if (idxB === -1)
            return -1;
        return idxA - idxB;
    });
    // fetch all subcategories for these root categories in one query
    const rootIds = categories.map((c) => c._id);
    const allSubs = await Category_1.default.find({ parent: { $in: rootIds } }).sort({ name: 1 });
    const subsMap = new Map();
    for (const sub of allSubs) {
        const key = String(sub.parent);
        if (!subsMap.has(key))
            subsMap.set(key, []);
        subsMap.get(key).push(sub);
    }
    const counts = await Product_1.default.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
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
});
// ─── GET /api/categories/:id/subcategories ────────────────────────────────────
exports.getSubcategories = (0, express_async_handler_1.default)(async (req, res) => {
    const parent = await Category_1.default.findById(req.params.id);
    if (!parent)
        throw new error_middleware_1.AppError("Category not found", 404);
    const subcategories = await Category_1.default.find({ parent: parent._id }).sort({ name: 1 });
    const counts = await Product_1.default.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    const data = subcategories.map((cat) => ({
        ...cat.toObject(),
        productCount: countMap.get(String(cat._id)) ?? 0,
    }));
    res.status(200).json({ success: true, data });
});
// ─── GET /api/categories/:slug ────────────────────────────────────────────────
exports.getCategoryBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const category = await Category_1.default.findOne({ slug: req.params.slug });
    if (!category)
        throw new error_middleware_1.AppError("Category not found", 404);
    const products = await Product_1.default.find({ category: category._id }).populate("category", "name slug");
    res.status(200).json({
        success: true,
        data: { category, products },
    });
});
// ─── POST /api/categories (admin) ─────────────────────────────────────────────
exports.createCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, description, image, parent } = req.body;
    if (!name)
        throw new error_middleware_1.AppError("Category name is required", 400);
    let baseSlug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    if (parent) {
        const parentDoc = await Category_1.default.findById(parent);
        if (!parentDoc)
            throw new error_middleware_1.AppError("Parent category not found", 404);
        baseSlug = `${parentDoc.slug}-${baseSlug}`;
    }
    const category = await Category_1.default.create({
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
});
// ─── PUT /api/categories/:id (admin) ──────────────────────────────────────────
exports.updateCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, description, image } = req.body;
    const existing = await Category_1.default.findById(req.params.id);
    if (!existing)
        throw new error_middleware_1.AppError("Category not found", 404);
    const updateData = { description, image };
    if (name) {
        updateData.name = name;
        let baseSlug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
        if (existing.parent) {
            const parentDoc = await Category_1.default.findById(existing.parent);
            if (parentDoc)
                baseSlug = `${parentDoc.slug}-${baseSlug}`;
        }
        updateData.slug = baseSlug;
    }
    const category = await Category_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({
        success: true,
        message: "Category updated",
        data: category,
    });
});
// ─── DELETE /api/categories/:id (admin) ───────────────────────────────────────
exports.deleteCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const category = await Category_1.default.findById(req.params.id);
    if (!category)
        throw new error_middleware_1.AppError("Category not found", 404);
    const productCount = await Product_1.default.countDocuments({ category: category._id });
    if (productCount > 0) {
        throw new error_middleware_1.AppError(`Cannot delete category with ${productCount} associated products`, 400);
    }
    const subCount = await Category_1.default.countDocuments({ parent: category._id });
    if (subCount > 0) {
        throw new error_middleware_1.AppError(`Cannot delete category with ${subCount} subcategories. Delete subcategories first.`, 400);
    }
    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted" });
});
//# sourceMappingURL=category.controller.js.map