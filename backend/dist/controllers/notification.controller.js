"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.updateNotification = exports.createNotification = exports.getNotifications = exports.getActiveNotifications = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Notification_1 = __importDefault(require("../models/Notification"));
const error_middleware_1 = require("../middleware/error.middleware");
// ─── GET /api/notifications/active (Public Storefront) ───────────────────────
exports.getActiveNotifications = (0, express_async_handler_1.default)(async (_req, res) => {
    const notifications = await Notification_1.default.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5);
    res.status(200).json({
        success: true,
        data: notifications,
    });
});
// ─── GET /api/notifications (Admin Only) ─────────────────────────────────────
exports.getNotifications = (0, express_async_handler_1.default)(async (_req, res) => {
    const notifications = await Notification_1.default.find({}).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: notifications,
    });
});
// ─── POST /api/notifications (Admin Only) ────────────────────────────────────
exports.createNotification = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, message, type, image, link, buttonText, badgeText, promoCode, duration, isActive } = req.body;
    const hasTitle = Boolean(title && title.trim());
    const hasMessage = Boolean(message && message.trim());
    const hasImage = Boolean(image && image.trim());
    if (!hasTitle && !hasMessage && !hasImage) {
        throw new error_middleware_1.AppError("Notification content required (Title, Message, or Image)", 400);
    }
    const notification = await Notification_1.default.create({
        title: title ? title.trim() : "",
        message: message ? message.trim() : "",
        type: type || "special_offer",
        image: image || "",
        link: link || "",
        buttonText: buttonText ? buttonText.trim() : "",
        badgeText: badgeText ? badgeText.trim() : "",
        promoCode: promoCode ? promoCode.trim() : "",
        duration: duration || 5,
        isActive: isActive !== undefined ? isActive : true,
    });
    res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: notification,
    });
});
// ─── PUT /api/notifications/:id (Admin Only) ─────────────────────────────────
exports.updateNotification = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const notification = await Notification_1.default.findById(id);
    if (!notification) {
        throw new error_middleware_1.AppError("Notification not found", 404);
    }
    const { title, message, type, image, link, buttonText, badgeText, promoCode, duration, isActive } = req.body;
    if (title !== undefined)
        notification.title = title;
    if (message !== undefined)
        notification.message = message;
    if (type !== undefined)
        notification.type = type;
    if (image !== undefined)
        notification.image = image;
    if (link !== undefined)
        notification.link = link;
    if (buttonText !== undefined)
        notification.buttonText = buttonText;
    if (badgeText !== undefined)
        notification.badgeText = badgeText;
    if (promoCode !== undefined)
        notification.promoCode = promoCode;
    if (duration !== undefined)
        notification.duration = duration;
    if (isActive !== undefined)
        notification.isActive = isActive;
    await notification.save();
    res.status(200).json({
        success: true,
        message: "Notification updated successfully",
        data: notification,
    });
});
// ─── DELETE /api/notifications/:id (Admin Only) ──────────────────────────────
exports.deleteNotification = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const notification = await Notification_1.default.findById(id);
    if (!notification) {
        throw new error_middleware_1.AppError("Notification not found", 404);
    }
    await notification.deleteOne();
    res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
    });
});
//# sourceMappingURL=notification.controller.js.map