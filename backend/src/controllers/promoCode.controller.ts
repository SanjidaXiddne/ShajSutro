import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import PromoCode from "../models/PromoCode";
import Order from "../models/Order";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../types";

// ─── Ensure Default WELCOME10 Promo Code Exists ───────────────────────────────

export const ensureWelcomePromoCode = async (): Promise<void> => {
  try {
    const existing = await PromoCode.findOne({ code: "WELCOME10" });
    if (!existing) {
      await PromoCode.create({
        code: "WELCOME10",
        type: "percentage",
        value: 10,
        minOrderAmount: 0,
        maxUses: null,
        usageLimitPerUser: 1,
        isFirstOrderOnly: true,
        isActive: true,
        description: "Welcome to ShajSutro! 10% OFF on your first order (1 time use per registered user)",
      });
      console.log("✓ Initialized default promo code: WELCOME10 (10% OFF First Order, 1 Use Per User)");
    }
  } catch (err) {
    console.error("Error ensuring default promo code:", err);
  }
};

// ─── GET /api/promo-codes (admin) ────────────────────────────────────────────

export const getAllPromoCodes = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    await ensureWelcomePromoCode();
    const codes = await PromoCode.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: codes });
  }
);

// ─── POST /api/promo-codes (admin) ───────────────────────────────────────────

export const createPromoCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      maxUses,
      usageLimitPerUser,
      isFirstOrderOnly,
      expiresAt,
      description,
      isActive,
    } = req.body as {
      code: string;
      type: "percentage" | "fixed";
      value: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number | null;
      maxUses?: number | null;
      usageLimitPerUser?: number | null;
      isFirstOrderOnly?: boolean;
      expiresAt?: string | null;
      description?: string;
      isActive?: boolean;
    };

    if (!code || !type || value === undefined) {
      throw new AppError("Code, type, and discount value are required", 400);
    }
    if (type === "percentage" && (value <= 0 || value > 100)) {
      throw new AppError("Percentage value must be between 1 and 100", 400);
    }
    if (type === "fixed" && value <= 0) {
      throw new AppError("Fixed discount must be greater than 0", 400);
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await PromoCode.findOne({ code: cleanCode });
    if (existing) throw new AppError(`Promo code "${cleanCode}" already exists`, 400);

    const promo = await PromoCode.create({
      code: cleanCode,
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount !== undefined && maxDiscountAmount !== null && maxDiscountAmount !== ("" as any) ? Number(maxDiscountAmount) : null,
      maxUses: maxUses !== undefined && maxUses !== null && maxUses !== ("" as any) ? Number(maxUses) : null,
      usageLimitPerUser: usageLimitPerUser !== undefined && usageLimitPerUser !== null && usageLimitPerUser !== ("" as any) ? Number(usageLimitPerUser) : 1,
      isFirstOrderOnly: Boolean(isFirstOrderOnly),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      description: description ? description.trim() : "",
    });

    res.status(201).json({ success: true, data: promo });
  }
);

// ─── PUT /api/promo-codes/:id (admin) ────────────────────────────────────────

export const updatePromoCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body as Partial<{
      type: "percentage" | "fixed";
      value: number;
      minOrderAmount: number;
      maxDiscountAmount: number | null;
      maxUses: number | null;
      usageLimitPerUser: number | null;
      isFirstOrderOnly: boolean;
      isActive: boolean;
      expiresAt: string | null;
      description: string;
    }>;

    if (updates.type === "percentage" && updates.value !== undefined && (updates.value <= 0 || updates.value > 100)) {
      throw new AppError("Percentage value must be between 1 and 100", 400);
    }
    if (updates.type === "fixed" && updates.value !== undefined && updates.value <= 0) {
      throw new AppError("Fixed discount must be greater than 0", 400);
    }

    const cleanUpdates: any = { ...updates };
    if (updates.expiresAt !== undefined) {
      cleanUpdates.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null;
    }
    if (updates.maxDiscountAmount !== undefined) {
      cleanUpdates.maxDiscountAmount =
        updates.maxDiscountAmount !== null && updates.maxDiscountAmount !== ("" as any)
          ? Number(updates.maxDiscountAmount)
          : null;
    }
    if (updates.maxUses !== undefined) {
      cleanUpdates.maxUses =
        updates.maxUses !== null && updates.maxUses !== ("" as any)
          ? Number(updates.maxUses)
          : null;
    }
    if (updates.usageLimitPerUser !== undefined) {
      cleanUpdates.usageLimitPerUser =
        updates.usageLimitPerUser !== null && updates.usageLimitPerUser !== ("" as any)
          ? Number(updates.usageLimitPerUser)
          : null;
    }
    if (updates.isFirstOrderOnly !== undefined) {
      cleanUpdates.isFirstOrderOnly = Boolean(updates.isFirstOrderOnly);
    }
    if (updates.minOrderAmount !== undefined) {
      cleanUpdates.minOrderAmount = Number(updates.minOrderAmount) || 0;
    }
    if (updates.value !== undefined) {
      cleanUpdates.value = Number(updates.value);
    }

    const promo = await PromoCode.findByIdAndUpdate(
      id,
      cleanUpdates,
      { new: true, runValidators: true }
    );
    if (!promo) throw new AppError("Promo code not found", 404);

    res.status(200).json({ success: true, data: promo });
  }
);

// ─── DELETE /api/promo-codes/:id (admin) ─────────────────────────────────────

export const deletePromoCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const promo = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promo) throw new AppError("Promo code not found", 404);
    res.status(200).json({ success: true, message: "Promo code deleted" });
  }
);

// ─── POST /api/promo-codes/apply (user/checkout) ─────────────────────────────

export const applyPromoCode = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { code, cartTotal, email } = req.body as {
      code: string;
      cartTotal: number;
      email?: string;
    };

    if (!code || !code.trim()) {
      throw new AppError("Please provide a promo code", 400);
    }
    if (cartTotal === undefined || cartTotal <= 0) {
      throw new AppError("Cart total must be greater than 0 to apply discount", 400);
    }

    const codeUpper = code.trim().toUpperCase();
    const promo = await PromoCode.findOne({ code: codeUpper });

    if (!promo || !promo.isActive) {
      throw new AppError("Invalid or inactive promo code", 400);
    }
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      throw new AppError("This promo code has expired", 400);
    }
    if (promo.maxUses !== null && promo.maxUses !== undefined && promo.usedCount >= promo.maxUses) {
      throw new AppError("This promo code has reached its overall usage limit", 400);
    }
    if (promo.minOrderAmount > 0 && cartTotal < promo.minOrderAmount) {
      throw new AppError(
        `Minimum order amount of ৳${promo.minOrderAmount} is required for this code`,
        400
      );
    }

    const userEmail = (email || req.user?.email || "").trim().toLowerCase();
    const userId = req.user?._id;

    // ── 1. First Order Only Validation ────────────────────────────────────────
    if (promo.isFirstOrderOnly) {
      if (!userId && !userEmail) {
        throw new AppError(
          "This promo code is exclusively for registered users on their first order. Please log in or enter your email.",
          400
        );
      }

      const orderQueryConditions: any[] = [];
      if (userId) {
        orderQueryConditions.push({ user: userId });
      }
      if (userEmail) {
        orderQueryConditions.push({ "shippingAddress.email": userEmail });
      }

      if (orderQueryConditions.length > 0) {
        const previousOrders = await Order.countDocuments({
          $or: orderQueryConditions,
          status: { $nin: ["cancelled", "refunded"] },
        });

        if (previousOrders > 0) {
          throw new AppError(
            `Promo code "${promo.code}" is only valid on your 1st order. You have already placed ${previousOrders} order${previousOrders > 1 ? "s" : ""}.`,
            400
          );
        }
      }
    }

    // ── 2. Per-User Usage Limit Validation ────────────────────────────────────
    const perUserLimit = promo.usageLimitPerUser !== undefined && promo.usageLimitPerUser !== null
      ? promo.usageLimitPerUser
      : (promo.isFirstOrderOnly ? 1 : null);

    if (perUserLimit !== null && perUserLimit > 0) {
      if (!userId && !userEmail) {
        throw new AppError(
          "Please log in or enter your shipping email to verify eligibility for this promo code.",
          400
        );
      }

      let usedByUserCount = 0;

      // Check stored usedByUsers array in PromoCode
      if (promo.usedByUsers && promo.usedByUsers.length > 0) {
        usedByUserCount = promo.usedByUsers.filter((u) => {
          const idMatch = userId && u.userId && u.userId.toString() === userId.toString();
          const emailMatch = userEmail && u.email && u.email.toLowerCase() === userEmail;
          return idMatch || emailMatch;
        }).length;
      }

      // Cross-check Orders collection for completeness
      const orderQueryConditions: any[] = [];
      if (userId) orderQueryConditions.push({ user: userId });
      if (userEmail) orderQueryConditions.push({ "shippingAddress.email": userEmail });

      if (orderQueryConditions.length > 0) {
        const ordersWithCode = await Order.countDocuments({
          $or: orderQueryConditions,
          promoCode: promo.code,
          status: { $nin: ["cancelled", "refunded"] },
        });
        usedByUserCount = Math.max(usedByUserCount, ordersWithCode);
      }

      if (usedByUserCount >= perUserLimit) {
        throw new AppError(
          `You have already used "${promo.code}". This code has a limit of ${perUserLimit} use${perUserLimit > 1 ? "s" : ""} per customer.`,
          400
        );
      }
    }

    // ── 3. Calculate Discount Amount ──────────────────────────────────────────
    let discount =
      promo.type === "percentage"
        ? (cartTotal * promo.value) / 100
        : promo.value;

    if (promo.maxDiscountAmount && promo.maxDiscountAmount > 0) {
      discount = Math.min(discount, promo.maxDiscountAmount);
    }
    discount = Math.min(discount, cartTotal);

    const finalTotal = Math.max(cartTotal - discount, 0);

    res.status(200).json({
      success: true,
      message: `Promo code "${promo.code}" applied successfully!`,
      data: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discount: Math.round(discount * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100,
        isFirstOrderOnly: Boolean(promo.isFirstOrderOnly),
        usageLimitPerUser: promo.usageLimitPerUser,
        description: promo.description,
      },
    });
  }
);

