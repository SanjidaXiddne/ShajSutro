"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_middleware_1 = require("../middleware/error.middleware");
const Category_1 = __importDefault(require("../models/Category"));
const Product_1 = __importDefault(require("../models/Product"));
// ─── GET /api/products ────────────────────────────────────────────────────────
exports.getProducts = (0, express_async_handler_1.default)(async (req, res) => {
    const { ids, category, badge, isFeatured, minPrice, maxPrice, inStock, search, sort = "-createdAt", page = "1", limit = "12", } = req.query;
    const filter = { isVisible: { $ne: false } };
    if (ids) {
        const list = ids
            .split(",")
            .map((s) => s.trim())
            .filter((s) => mongoose_1.default.Types.ObjectId.isValid(s));
        filter._id = { $in: list.map((s) => new mongoose_1.default.Types.ObjectId(s)) };
    }
    if (category) {
        if (mongoose_1.default.Types.ObjectId.isValid(category)) {
            filter.category = category;
        }
        else {
            const cat = await Category_1.default.findOne({ slug: category });
            filter.category = cat ? cat._id : new mongoose_1.default.Types.ObjectId();
        }
    }
    if (badge)
        filter.badge = badge;
    if (isFeatured !== undefined)
        filter.isFeatured = isFeatured === "true";
    if (inStock !== undefined)
        filter.inStock = inStock === "true";
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice)
            filter.price.$gte = Number(minPrice);
        if (maxPrice)
            filter.price.$lte = Number(maxPrice);
    }
    if (search) {
        filter.$text = { $search: search };
    }
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit ?? "12"));
    const skip = (pageNum - 1) * limitNum;
    const [products, total] = await Promise.all([
        Product_1.default.find(filter)
            .populate("category", "name slug")
            .sort(sort)
            .skip(skip)
            .limit(limitNum),
        Product_1.default.countDocuments(filter),
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
});
// ─── GET /api/products/:id ────────────────────────────────────────────────────
exports.getProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const product = await Product_1.default.findById(req.params.id).populate("category", "name slug");
    if (!product)
        throw new error_middleware_1.AppError("Product not found", 404);
    res.status(200).json({
        success: true,
        data: product,
    });
});
// ─── POST /api/products (admin) ───────────────────────────────────────────────
exports.createProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, description, price, originalPrice, category, images, sizes, colors, badge, inStock, isFeatured, isVisible, stock, tags, } = req.body;
    if (!name || !description || !price || !category) {
        throw new error_middleware_1.AppError("Name, description, price, and category are required", 400);
    }
    const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "") +
        "-" +
        Date.now();
    const product = await Product_1.default.create({
        name,
        slug,
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
    const populated = await product.populate("category", "name slug");
    res.status(201).json({
        success: true,
        message: "Product created",
        data: populated,
    });
});
// ─── PUT /api/products/:id (admin) ────────────────────────────────────────────
exports.updateProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const updates = req.body;
    if (updates.name) {
        updates.slug =
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
    const product = await Product_1.default.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    }).populate("category", "name slug");
    if (!product)
        throw new error_middleware_1.AppError("Product not found", 404);
    res.status(200).json({
        success: true,
        message: "Product updated",
        data: product,
    });
});
// ─── DELETE /api/products/:id (admin) ─────────────────────────────────────────
exports.deleteProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const product = await Product_1.default.findById(req.params.id);
    if (!product)
        throw new error_middleware_1.AppError("Product not found", 404);
    await product.deleteOne();
    res.status(200).json({
        success: true,
        message: "Product deleted",
    });
});
//# sourceMappingURL=product.controller.js.map