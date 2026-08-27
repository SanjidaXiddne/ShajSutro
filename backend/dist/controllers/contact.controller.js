"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactMessage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const error_middleware_1 = require("../middleware/error.middleware");
const ContactMessage_1 = __importDefault(require("../models/ContactMessage"));
exports.createContactMessage = (0, express_async_handler_1.default)(async (req, res) => {
    const { topic, name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        throw new error_middleware_1.AppError("Name, email, subject, and message are required", 400);
    }
    const saved = await ContactMessage_1.default.create({
        topic: topic ?? "general",
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
    });
    res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: { id: saved._id },
    });
});
//# sourceMappingURL=contact.controller.js.map