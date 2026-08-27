"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeroStats = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
// ─── GET /api/stats/hero  (public) ─────────────────────────────────────────────
exports.getHeroStats = (0, express_async_handler_1.default)(async (_req, res) => {
    const [productsCount, customersCount, ratingAgg] = await Promise.all([
        Product_1.default.countDocuments({ isVisible: true }),
        User_1.default.countDocuments({ role: "user", isBlocked: false }),
        Product_1.default.aggregate([
            { $match: { isVisible: true } },
            { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ]),
    ]);
    const avgRating = ratingAgg.length > 0 && typeof ratingAgg[0]?.avgRating === "number"
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
});
//# sourceMappingURL=stats.controller.js.map