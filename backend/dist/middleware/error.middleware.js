"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = exports.AppError = void 0;
// ─── AppError class ───────────────────────────────────────────────────────────
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// ─── Not Found handler ────────────────────────────────────────────────────────
const notFound = (req, _res, next) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};
exports.notFound = notFound;
// ─── Global error handler ─────────────────────────────────────────────────────
const errorHandler = (err, _req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        message = "Resource not found — invalid ID";
        statusCode = 404;
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
        message = `Duplicate value for '${field}'. Please use a different value.`;
        statusCode = 400;
    }
    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
    }
    // JWT errors
    if (err.name === "JsonWebTokenError") {
        message = "Invalid token. Please log in again.";
        statusCode = 401;
    }
    if (err.name === "TokenExpiredError") {
        message = "Token expired. Please log in again.";
        statusCode = 401;
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map