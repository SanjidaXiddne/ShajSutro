"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductReviews = exports.getMyReviews = exports.createReview = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const error_middleware_1 = require("../middleware/error.middleware");
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const Review_1 = __importDefault(require("../models/Review"));
// ─── POST /api/reviews ────────────────────────────────────────────────────────
// Protected — submit a review for a product from a delivered order
exports.createReview = (0, express_async_handler_1.default)(async (req, res) => {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user._id;
    if (!productId || !orderId || !rating) {
        throw new error_middleware_1.AppError("productId, orderId, and rating are required", 400);
    }
    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
        throw new error_middleware_1.AppError("Rating must be between 1 and 5", 400);
    }
    // Verify order belongs to user and is delivered
    const order = await Order_1.default.findOne({ _id: orderId, user: userId });
    if (!order)
        throw new error_middleware_1.AppError("Order not found", 404);
    if (order.status !== "delivered") {
        throw new error_middleware_1.AppError("You can only review products from delivered orders", 400);
    }
    // Verify product is in the order
    const hasProduct = order.items.some((item) => item.product && item.product.toString() === productId);
    if (!hasProduct) {
        throw new error_middleware_1.AppError("This product is not in the specified order", 400);
    }
    // Check for duplicate review
    const existing = await Review_1.default.findOne({
        user: userId, product: productId, order: orderId,
    });
    if (existing)
        throw new error_middleware_1.AppError("You have already reviewed this product", 409);
    // Create review
    const review = await Review_1.default.create({
        product: productId,
        user: userId,
        order: orderId,
        rating: numRating,
        comment: comment ?? "",
    });
    // Recalculate product average rating
    const allReviews = await Review_1.default.find({ product: productId });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Product_1.default.findByIdAndUpdate(productId, {
        rating: Math.round(avg * 10) / 10,
        reviews: allReviews.length,
    });
    res.status(201).json({ success: true, data: review });
});
// ─── GET /api/reviews/mine ────────────────────────────────────────────────────
// Protected — get current user's review history (product + order pairs)
exports.getMyReviews = (0, express_async_handler_1.default)(async (req, res) => {
    const reviews = await Review_1.default.find({ user: req.user._id })
        .select("product order rating")
        .lean();
    res.status(200).json({ success: true, data: reviews });
});
// ─── GET /api/reviews/product/:productId ──────────────────────────────────────
// Public — get paginated reviews for a specific product
exports.getProductReviews = (0, express_async_handler_1.default)(async (req, res) => {
    const { productId } = req.params;
    const page = Math.max(1, parseInt(req.query.page ?? "1"));
    const limit = Math.min(20, parseInt(req.query.limit ?? "10"));
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
        Review_1.default.find({ product: productId })
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Review_1.default.countDocuments({ product: productId }),
    ]);
    res.status(200).json({
        success: true,
        data: reviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});
//# sourceMappingURL=review.controller.js.map