"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPromoCode = exports.deletePromoCode = exports.updatePromoCode = exports.createPromoCode = exports.getAllPromoCodes = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const PromoCode_1 = __importDefault(require("../models/PromoCode"));
const error_middleware_1 = require("../middleware/error.middleware");
// ─── GET /api/promo-codes  (admin) ────────────────────────────────────────────
exports.getAllPromoCodes = (0, express_async_handler_1.default)(async (_req, res) => {
    const codes = await PromoCode_1.default.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: codes });
});
// ─── POST /api/promo-codes  (admin) ───────────────────────────────────────────
exports.createPromoCode = (0, express_async_handler_1.default)(async (req, res) => {
    const { code, type, value, minOrderAmount, maxUses, expiresAt, description } = req.body;
    if (!code || !type || value === undefined) {
        throw new error_middleware_1.AppError("code, type and value are required", 400);
    }
    if (type === "percentage" && (value <= 0 || value > 100)) {
        throw new error_middleware_1.AppError("Percentage value must be between 1 and 100", 400);
    }
    if (type === "fixed" && value <= 0) {
        throw new error_middleware_1.AppError("Fixed discount must be greater than 0", 400);
    }
    const existing = await PromoCode_1.default.findOne({ code: code.toUpperCase() });
    if (existing)
        throw new error_middleware_1.AppError("A promo code with that name already exists", 400);
    const promo = await PromoCode_1.default.create({
        code: code.toUpperCase(),
        type,
        value,
        minOrderAmount: minOrderAmount ?? 0,
        maxUses: maxUses ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        description: description ?? "",
    });
    res.status(201).json({ success: true, data: promo });
});
// ─── PUT /api/promo-codes/:id  (admin) ────────────────────────────────────────
exports.updatePromoCode = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const promo = await PromoCode_1.default.findByIdAndUpdate(id, {
        ...updates,
        ...(updates.expiresAt !== undefined
            ? { expiresAt: updates.expiresAt ? new Date(updates.expiresAt) : null }
            : {}),
    }, { new: true, runValidators: true });
    if (!promo)
        throw new error_middleware_1.AppError("Promo code not found", 404);
    res.status(200).json({ success: true, data: promo });
});
// ─── DELETE /api/promo-codes/:id  (admin) ─────────────────────────────────────
exports.deletePromoCode = (0, express_async_handler_1.default)(async (req, res) => {
    const promo = await PromoCode_1.default.findByIdAndDelete(req.params.id);
    if (!promo)
        throw new error_middleware_1.AppError("Promo code not found", 404);
    res.status(200).json({ success: true, message: "Promo code deleted" });
});
// ─── POST /api/promo-codes/apply  (user — auth required) ─────────────────────
exports.applyPromoCode = (0, express_async_handler_1.default)(async (req, res) => {
    const { code, cartTotal } = req.body;
    if (!code)
        throw new error_middleware_1.AppError("Please provide a promo code", 400);
    if (!cartTotal || cartTotal <= 0)
        throw new error_middleware_1.AppError("Invalid cart total", 400);
    const promo = await PromoCode_1.default.findOne({ code: code.trim().toUpperCase() });
    if (!promo || !promo.isActive) {
        throw new error_middleware_1.AppError("Invalid or inactive promo code", 400);
    }
    if (promo.expiresAt && new Date() > promo.expiresAt) {
        throw new error_middleware_1.AppError("This promo code has expired", 400);
    }
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
        throw new error_middleware_1.AppError("This promo code has reached its usage limit", 400);
    }
    if (cartTotal < promo.minOrderAmount) {
        throw new error_middleware_1.AppError(`Minimum order amount of ৳${promo.minOrderAmount} required for this code`, 400);
    }
    const discount = promo.type === "percentage"
        ? Math.min((cartTotal * promo.value) / 100, cartTotal)
        : Math.min(promo.value, cartTotal);
    const finalTotal = Math.max(cartTotal - discount, 0);
    res.status(200).json({
        success: true,
        data: {
            code: promo.code,
            type: promo.type,
            value: promo.value,
            discount: Math.round(discount * 100) / 100,
            finalTotal: Math.round(finalTotal * 100) / 100,
            description: promo.description,
        },
    });
});
//# sourceMappingURL=promoCode.controller.js.map