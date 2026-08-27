"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeNewsletter = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Subscriber_1 = __importDefault(require("../models/Subscriber"));
const error_middleware_1 = require("../middleware/error.middleware");
const emailService_1 = require("../services/emailService");
// ─── POST /api/newsletter/subscribe ───────────────────────────────────────────
exports.subscribeNewsletter = (0, express_async_handler_1.default)(async (req, res) => {
    const { email } = req.body;
    if (!email || !email.trim()) {
        throw new error_middleware_1.AppError("Email address is required", 400);
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        throw new error_middleware_1.AppError("Please enter a valid email address", 400);
    }
    let subscriber = await Subscriber_1.default.findOne({ email: cleanEmail });
    if (subscriber) {
        if (subscriber.isActive) {
            res.status(200).json({
                success: true,
                message: "You are already subscribed to our newsletter!",
                data: subscriber,
            });
            return;
        }
        else {
            subscriber.isActive = true;
            subscriber.subscribedAt = new Date();
            await subscriber.save();
        }
    }
    else {
        subscriber = await Subscriber_1.default.create({
            email: cleanEmail,
            isActive: true,
            subscribedAt: new Date(),
        });
    }
    // Send welcome email asynchronously
    (0, emailService_1.sendNewsletterWelcomeEmail)(cleanEmail).catch((err) => {
        console.error("Newsletter welcome email error:", err);
    });
    res.status(201).json({
        success: true,
        message: "Subscribed successfully! Welcome to ShajSutro VIP.",
        data: subscriber,
    });
});
//# sourceMappingURL=subscriber.controller.js.map