import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import Product from "../models/Product";
import User from "../models/User";

// ─── GET /api/stats/hero  (public) ─────────────────────────────────────────────
export const getHeroStats = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const [productsCount, customersCount, ratingAgg] = await Promise.all([
      Product.countDocuments({ isVisible: true }),
      User.countDocuments({ role: "user", isBlocked: false }),
      Product.aggregate<{ avgRating: number }>([
        { $match: { isVisible: true } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]),
    ]);

    const avgRating =
      ratingAgg.length > 0 && typeof ratingAgg[0]?.avgRating === "number"
        ? ratingAgg[0].avgRating
        : 0;

    res.status(200).json({
      success: true,
      data: {
        productsCount,
        customersCount,
        avgRating,
      },
    });
  }
);

