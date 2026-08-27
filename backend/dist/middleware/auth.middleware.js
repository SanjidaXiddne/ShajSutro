"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootAdminOnly = exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const error_middleware_1 = require("./error.middleware");
// ─── protect: verify JWT and attach req.user ──────────────────────────────────
exports.protect = (0, express_async_handler_1.default)(async (req, _res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new error_middleware_1.AppError("Not authorized — no token provided", 401));
    }
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new error_middleware_1.AppError("JWT_SECRET not configured", 500);
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    const user = await User_1.default.findById(decoded.id).select("-password");
    if (!user) {
        return next(new error_middleware_1.AppError("User belonging to this token no longer exists", 401));
    }
    req.user = user;
    next();
});
// ─── adminOnly: restrict access to admin or sub-admin roles ───────────────────
const adminOnly = (req, _res, next) => {
    if (!req.user ||
        (req.user.role !== "admin" &&
            req.user.role !== "sub-admin" &&
            req.user.adminRole !== "sub_admin")) {
        return next(new error_middleware_1.AppError("Access denied — admin or sub-admin only", 403));
    }
    next();
};
exports.adminOnly = adminOnly;
// ─── rootAdminOnly: restrict access to full root admin only ───────────────────
const rootAdminOnly = (req, _res, next) => {
    if (!req.user ||
        req.user.role !== "admin" ||
        req.user.adminRole === "sub_admin") {
        return next(new error_middleware_1.AppError("Access denied — root admin privileges required", 403));
    }
    next();
};
exports.rootAdminOnly = rootAdminOnly;
//# sourceMappingURL=auth.middleware.js.map