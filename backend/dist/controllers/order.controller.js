"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackOrder = exports.requestExchange = exports.cancelOrder = exports.getOrderInvoice = exports.getOrder = exports.getMyOrders = exports.placeOrder = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const PromoCode_1 = __importDefault(require("../models/PromoCode"));
const error_middleware_1 = require("../middleware/error.middleware");
const emailService_1 = require("../services/emailService");
// ─── POST /api/orders — place order ───────────────────────────────────────────
exports.placeOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const { shippingAddress, paymentMethod, txnId = "", items: frontendItems, discount = 0, promoCode = "", } = req.body;
    if (!shippingAddress)
        throw new error_middleware_1.AppError("Shipping address is required", 400);
    if (!shippingAddress.phone || !/^01[3-9]\d{8}$/.test(shippingAddress.phone.trim())) {
        throw new error_middleware_1.AppError("Phone number must be valid 11 digits (e.g. 017XXXXXXXX)", 400);
    }
    if (!paymentMethod)
        throw new error_middleware_1.AppError("Payment method is required", 400);
    if (!frontendItems || frontendItems.length === 0)
        throw new error_middleware_1.AppError("Order must contain at least one item", 400);
    if (paymentMethod !== "cod" && !txnId.trim())
        throw new error_middleware_1.AppError("Transaction ID is required for mobile payments", 400);
    // Build order items and validate stock (when product exists in DB)
    const orderItems = [];
    const stockOps = [];
    for (const item of frontendItems) {
        if (!item)
            continue;
        const rawId = (item.productId ?? "").toString().trim();
        const itemName = item.name ?? "Product";
        const product = mongoose_1.default.isValidObjectId(rawId)
            ? await Product_1.default.findById(rawId)
            : // Fallbacks for when frontend uses a non-Mongo id (e.g. local dataset)
                (await Product_1.default.findOne({ slug: rawId.toLowerCase() })) ??
                    (await Product_1.default.findOne({
                        name: { $regex: `^${rawId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
                    })) ??
                    (await Product_1.default.findOne({
                        name: { $regex: `^${itemName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
                    }));
        // If product isn't in DB, still allow order placement using frontend snapshot
        // (useful when the storefront uses local/static products)
        if (!product) {
            orderItems.push({
                name: itemName,
                price: item.price ?? 0,
                quantity: item.quantity ?? 1,
                size: item.size,
                color: item.color,
                image: item.image ?? "",
            });
            continue;
        }
        if (!product.inStock)
            throw new error_middleware_1.AppError(`"${product.name}" is out of stock`, 400);
        if (product.stock > 0 && item.quantity > product.stock) {
            throw new error_middleware_1.AppError(`Only ${product.stock} unit${product.stock !== 1 ? "s" : ""} of "${product.name}" available`, 400);
        }
        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: product.images[0] ?? "",
        });
        stockOps.push(Product_1.default.findByIdAndUpdate(product._id, {
            $inc: { stock: -item.quantity, totalOrdered: item.quantity },
        }));
    }
    const subtotal = parseFloat(orderItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2));
    const shippingCost = subtotal >= 1200 ? 0 : 9.99;
    const tax = 0;
    const discountAmt = parseFloat(Math.min(discount, subtotal).toFixed(2));
    const total = parseFloat((subtotal + shippingCost - discountAmt).toFixed(2));
    const paymentStatus = paymentMethod === "cod" ? "pending_delivery" : "paid";
    const order = await Order_1.default.create({
        user: req.user?._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        txnId: txnId.trim(),
        paymentStatus,
        subtotal,
        shippingCost,
        tax,
        discount: discountAmt,
        promoCode: promoCode.trim().toUpperCase(),
        total,
        status: "pending",
        statusHistory: [
            {
                status: "pending",
                updatedAt: new Date(),
                note: "Order submitted",
            },
        ],
    });
    // Decrement stock and increment totalOrdered (only for DB-backed products)
    await Promise.all(stockOps);
    // Increment promo code usage count if a promo code was applied
    if (promoCode && typeof promoCode === "string" && promoCode.trim()) {
        await PromoCode_1.default.findOneAndUpdate({ code: promoCode.trim().toUpperCase() }, { $inc: { usedCount: 1 } }).catch((err) => {
            console.error("Failed to increment promo code usage count:", err);
        });
    }
    // Send Order Confirmation Email asynchronously
    const recipientEmail = shippingAddress.email || req.user?.email;
    if (recipientEmail) {
        (0, emailService_1.sendOrderConfirmationEmail)(recipientEmail, order).catch((err) => {
            console.error("Order confirmation email sending error:", err);
        });
    }
    res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: order,
    });
});
// ─── GET /api/orders — user order history ─────────────────────────────────────
exports.getMyOrders = (0, express_async_handler_1.default)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page ?? "1"));
    const limit = Math.min(20, parseInt(req.query.limit ?? "10"));
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        Order_1.default.find({ user: req.user?._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order_1.default.countDocuments({ user: req.user?._id }),
    ]);
    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});
// ─── GET /api/orders/:id — single order ───────────────────────────────────────
exports.getOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const order = await Order_1.default.findById(req.params.id).populate("user", "name email");
    if (!order)
        throw new error_middleware_1.AppError("Order not found", 404);
    // Allow access only to the owner or admin
    if (order.user._id.toString() !== req.user?._id.toString() &&
        req.user?.role !== "admin") {
        throw new error_middleware_1.AppError("Not authorized to view this order", 403);
    }
    res.status(200).json({
        success: true,
        data: order,
    });
});
// ─── GET /api/orders/:id/invoice — invoice PDF ────────────────────────────────
exports.getOrderInvoice = (0, express_async_handler_1.default)(async (req, res) => {
    const order = await Order_1.default.findById(req.params.id).populate("user", "name email");
    if (!order)
        throw new error_middleware_1.AppError("Order not found", 404);
    // Only owner or admin
    if (order.user &&
        order.user._id &&
        order.user._id.toString() !== req.user?._id.toString() &&
        req.user?.role !== "admin") {
        throw new error_middleware_1.AppError("Not authorized to download this invoice", 403);
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order._id.toString()}.pdf`);
    const doc = new pdfkit_1.default({ margin: 50 });
    doc.pipe(res);
    // Header
    doc
        .fontSize(20)
        .text("ShajSutro", { align: "left" })
        .moveDown(0.5);
    doc
        .fontSize(10)
        .fillColor("#666666")
        .text(`Invoice ID: ${order._id.toString()}`)
        .text(`Date: ${new Date(order.createdAt ?? Date.now()).toLocaleString()}`)
        .moveDown();
    // Billing / Shipping
    const addr = order.shippingAddress;
    doc
        .fillColor("#000000")
        .fontSize(12)
        .text("Billing / Shipping To:", { underline: true })
        .moveDown(0.3);
    doc
        .fontSize(10)
        .text(`${addr.firstName ?? ""} ${addr.lastName ?? ""}`)
        .text(addr.address ?? "")
        .text([addr.city, addr.state, addr.zip].filter(Boolean).join(", "))
        .text(addr.country ?? "")
        .text(addr.phone ?? "")
        .moveDown();
    // Items table
    doc
        .fontSize(12)
        .text("Items", { underline: true })
        .moveDown(0.3);
    const items = order.items;
    items.forEach((item) => {
        doc
            .fontSize(10)
            .text(`${item.name} (${item.size ?? ""} ${item.color ?? ""}) x${item.quantity}`, { continued: true })
            .text(`  ৳${(item.price * item.quantity).toFixed(2)}`, { align: "right" });
    });
    doc.moveDown();
    // Totals
    doc
        .fontSize(10)
        .text(`Subtotal: ৳${order.subtotal.toFixed(2)}`, { align: "right" });
    doc.text(`Shipping: ${order.shippingCost === 0 ? "Free" : `৳${order.shippingCost.toFixed(2)}`}`, { align: "right" });
    if (order.discount && order.discount > 0) {
        doc.text(`Discount (Promo): -৳${order.discount.toFixed(2)}`, {
            align: "right",
        });
    }
    doc
        .fontSize(12)
        .text(`Total: ৳${order.total.toFixed(2)}`, {
        align: "right",
    })
        .moveDown();
    // Payment info
    doc
        .fontSize(10)
        .fillColor("#666666")
        .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`);
    if (order.txnId) {
        doc.text(`TxnID: ${order.txnId}`);
    }
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.end();
});
// ─── PUT /api/orders/:id/cancel — cancel order ────────────────────────────────
exports.cancelOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const order = await Order_1.default.findById(req.params.id);
    if (!order)
        throw new error_middleware_1.AppError("Order not found", 404);
    if (order.user.toString() !== req.user?._id.toString()) {
        throw new error_middleware_1.AppError("Not authorized", 403);
    }
    if (order.status !== "pending") {
        throw new error_middleware_1.AppError("Order can only be cancelled while status is Pending. Once confirmed, cancellation is disabled.", 400);
    }
    order.status = "cancelled";
    if (!order.statusHistory)
        order.statusHistory = [];
    order.statusHistory.push({
        status: "cancelled",
        updatedAt: new Date(),
        note: "Cancelled by customer",
    });
    await order.save();
    res.status(200).json({
        success: true,
        message: "Order cancelled",
        data: order,
    });
});
// ─── POST /api/orders/:id/exchange — request exchange/return ───────────────
exports.requestExchange = (0, express_async_handler_1.default)(async (req, res) => {
    const { reason, items } = req.body;
    if (!reason || !reason.trim()) {
        throw new error_middleware_1.AppError("Please provide a reason for exchange/return", 400);
    }
    const order = await Order_1.default.findById(req.params.id);
    if (!order)
        throw new error_middleware_1.AppError("Order not found", 404);
    if (order.user.toString() !== req.user?._id.toString()) {
        throw new error_middleware_1.AppError("Not authorized", 403);
    }
    if (order.status !== "delivered") {
        throw new error_middleware_1.AppError("Exchange or return can only be requested for delivered orders", 400);
    }
    order.exchangeRequest = {
        requestedAt: new Date(),
        status: "pending",
        reason: reason.trim(),
        items: items && items.length > 0 ? items.map(i => ({
            name: i.name,
            size: i.size || "",
            color: i.color || "",
            quantity: i.quantity || 1,
        })) : order.items.map(i => ({
            name: i.name,
            size: i.size || "",
            color: i.color || "",
            quantity: i.quantity,
        })),
        adminNote: "",
    };
    if (!order.statusHistory)
        order.statusHistory = [];
    order.statusHistory.push({
        status: "pending",
        updatedAt: new Date(),
        note: `Exchange / Return requested: ${reason.trim()}`,
    });
    await order.save();
    res.status(200).json({
        success: true,
        message: "Exchange request submitted successfully",
        data: order,
    });
});
// ─── POST /api/orders/track — Public Order Tracking ───────────────────────────
exports.trackOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const { orderId, query } = req.body;
    const rawSearch = (orderId || query || "").trim();
    if (!rawSearch) {
        throw new error_middleware_1.AppError("Please enter an Order ID, Phone number, or Transaction ID", 400);
    }
    // Strip leading '#' if customer copied reference like '#E1841066'
    const searchId = rawSearch.replace(/^#/g, "").trim();
    let order = null;
    if (mongoose_1.default.isValidObjectId(searchId)) {
        order = await Order_1.default.findById(searchId).populate("user", "name email");
    }
    if (!order) {
        const escaped = searchId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "i");
        order = await Order_1.default.findOne({
            $or: [
                { $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: escaped, options: "i" } } },
                { "shippingAddress.phone": regex },
                { "shippingAddress.email": regex },
                { txnId: regex },
            ],
        })
            .sort({ createdAt: -1 })
            .populate("user", "name email");
    }
    if (!order) {
        throw new error_middleware_1.AppError("No order found matching your search. Please check your Order ID, Phone number, or Txn ID.", 404);
    }
    res.status(200).json({
        success: true,
        data: order,
    });
});
//# sourceMappingURL=order.controller.js.map