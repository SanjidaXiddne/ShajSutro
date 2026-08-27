import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../types";
import Order from "../models/Order";
import Product from "../models/Product";
import Review from "../models/Review";

// ─── POST /api/reviews ────────────────────────────────────────────────────────
// Protected — submit a review for a product from a delivered order

export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user!._id;

    if (!productId || !orderId || !rating) {
      throw new AppError("productId, orderId, and rating are required", 400);
    }
    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      throw new AppError("Rating must be between 1 and 5", 400);
    }

    // Verify order belongs to user and is delivered
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new AppError("Order not found", 404);
    if (order.status !== "delivered") {
      throw new AppError("You can only review products from delivered orders", 400);
    }

    // Verify product is in the order
    const hasProduct = order.items.some(
      (item) => item.product && item.product.toString() === productId,
    );
    if (!hasProduct) {
      throw new AppError("This product is not in the specified order", 400);
    }

    // Check for duplicate review
    const existing = await Review.findOne({
      user: userId, product: productId, order: orderId,
    });
    if (existing) throw new AppError("You have already reviewed this product", 409);

    // Create review
    const review = await Review.create({
      product: productId,
      user: userId,
      order: orderId,
      rating: numRating,
      comment: comment ?? "",
    });

    // Recalculate product average rating
    const allReviews = await Review.find({ product: productId });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avg * 10) / 10,
      reviews: allReviews.length,
    });

    res.status(201).json({ success: true, data: review });
  },
);

// ─── GET /api/reviews/mine ────────────────────────────────────────────────────
// Protected — get current user's review history (product + order pairs)

export const getMyReviews = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const reviews = await Review.find({ user: req.user!._id })
      .select("product order rating")
      .lean();
    res.status(200).json({ success: true, data: reviews });
  },
);

// ─── GET /api/reviews/product/:productId ──────────────────────────────────────
// Public — get paginated reviews for a specific product

export const getProductReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;
    const page  = Math.max(1, parseInt((req.query.page  as string) ?? "1"));
    const limit = Math.min(20, parseInt((req.query.limit as string) ?? "10"));
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: productId }),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  },
);
