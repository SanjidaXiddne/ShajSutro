"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const error_middleware_1 = require("../middleware/error.middleware");
// ─── GET /api/cart ────────────────────────────────────────────────────────────
exports.getCart = (0, express_async_handler_1.default)(async (req, res) => {
    const cart = await Cart_1.default.findOne({ user: req.user?._id }).populate("items.product", "name price originalPrice images inStock");
    if (!cart) {
        res.status(200).json({ success: true, data: { items: [] } });
        return;
    }
    res.status(200).json({ success: true, data: cart });
});
// ─── POST /api/cart ───────────────────────────────────────────────────────────
exports.addToCart = (0, express_async_handler_1.default)(async (req, res) => {
    const { productId, quantity = 1, size, color } = req.body;
    if (!productId || !size || !color) {
        throw new error_middleware_1.AppError("productId, size, and color are required", 400);
    }
    const product = await Product_1.default.findById(productId);
    if (!product)
        throw new error_middleware_1.AppError("Product not found", 404);
    if (!product.inStock)
        throw new error_middleware_1.AppError("Product is out of stock", 400);
    let cart = await Cart_1.default.findOne({ user: req.user?._id });
    if (!cart) {
        cart = await Cart_1.default.create({
            user: req.user?._id,
            items: [{ product: productId, quantity, size, color }],
        });
    }
    else {
        const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId &&
            item.size === size &&
            item.color === color);
        if (existingIndex >= 0) {
            cart.items[existingIndex].quantity += quantity;
        }
        else {
            cart.items.push({ product: product._id, quantity, size, color });
        }
        await cart.save();
    }
    const populated = await cart.populate("items.product", "name price originalPrice images inStock");
    res.status(200).json({
        success: true,
        message: "Item added to cart",
        data: populated,
    });
});
// ─── PUT /api/cart/:productId ─────────────────────────────────────────────────
exports.updateCartItem = (0, express_async_handler_1.default)(async (req, res) => {
    const { quantity, size, color } = req.body;
    if (!quantity || quantity < 1) {
        throw new error_middleware_1.AppError("Quantity must be at least 1", 400);
    }
    const cart = await Cart_1.default.findOne({ user: req.user?._id });
    if (!cart)
        throw new error_middleware_1.AppError("Cart not found", 404);
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === req.params.productId &&
        item.size === size &&
        item.color === color);
    if (itemIndex === -1)
        throw new error_middleware_1.AppError("Item not found in cart", 404);
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    const populated = await cart.populate("items.product", "name price originalPrice images inStock");
    res.status(200).json({
        success: true,
        message: "Cart updated",
        data: populated,
    });
});
// ─── DELETE /api/cart/:productId ──────────────────────────────────────────────
exports.removeCartItem = (0, express_async_handler_1.default)(async (req, res) => {
    const { size, color } = req.query;
    const cart = await Cart_1.default.findOne({ user: req.user?._id });
    if (!cart)
        throw new error_middleware_1.AppError("Cart not found", 404);
    const before = cart.items.length;
    cart.items = cart.items.filter((item) => !(item.product.toString() === req.params.productId &&
        item.size === size &&
        item.color === color));
    if (cart.items.length === before) {
        throw new error_middleware_1.AppError("Item not found in cart", 404);
    }
    await cart.save();
    const populated = await cart.populate("items.product", "name price originalPrice images inStock");
    res.status(200).json({
        success: true,
        message: "Item removed from cart",
        data: populated,
    });
});
// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
exports.clearCart = (0, express_async_handler_1.default)(async (req, res) => {
    await Cart_1.default.findOneAndUpdate({ user: req.user?._id }, { items: [] }, { new: true });
    res.status(200).json({
        success: true,
        message: "Cart cleared",
        data: { items: [] },
    });
});
//# sourceMappingURL=cart.controller.js.map