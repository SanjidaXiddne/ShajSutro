"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const error_middleware_1 = require("./middleware/error.middleware");
// ─── Route imports ────────────────────────────────────────────────────────────
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const jobApplication_routes_1 = __importDefault(require("./routes/jobApplication.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const promoCode_routes_1 = __importDefault(require("./routes/promoCode.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const newsletter_routes_1 = __importDefault(require("./routes/newsletter.routes"));
// ─── Connect to MongoDB Atlas ─────────────────────────────────────────────────
(0, db_1.default)();
// ─── Express app setup ────────────────────────────────────────────────────────
const app = (0, express_1.default)();
// CORS — allow localhost, *.vercel.app, and any origins in CLIENT_URL (comma-separated)
const allowedOrigins = (process.env.CLIENT_URL ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin)
            return callback(null, true);
        // Allow any localhost / 127.0.0.1 or local LAN IP (e.g. 192.168.x.x, 10.x.x.x for mobile testing) regardless of port
        if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/i.test(origin)) {
            return callback(null, true);
        }
        // Allow all Vercel deployment URLs (*.vercel.app)
        if (/^https:\/\/[^.]+\.vercel\.app$/i.test(origin)) {
            return callback(null, true);
        }
        // Allow any explicitly listed origin
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        // Allow all origins in non-strict mode
        return callback(null, true);
    },
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Static uploads (CV files)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadsBaseDir = isServerless ? os_1.default.tmpdir() : process.cwd();
const uploadsPath = path_1.default.join(uploadsBaseDir, "uploads");
try {
    if (!fs_1.default.existsSync(uploadsPath)) {
        fs_1.default.mkdirSync(uploadsPath, { recursive: true });
    }
}
catch {
    // Ignore filesystem error in read-only environment
}
app.use("/uploads", express_1.default.static(uploadsPath));
// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "ShajSutro API is running",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});
// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", auth_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/contact", contact_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/promo-codes", promoCode_routes_1.default);
app.use("/api/jobs", job_routes_1.default);
app.use("/api/job-applications", jobApplication_routes_1.default);
app.use("/api/newsletter", newsletter_routes_1.default);
app.use("/api/stats", stats_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
// ─── Error handling ───────────────────────────────────────────────────────────
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
// ─── Start server ─────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
    const PORT = parseInt(process.env.PORT ?? "4000", 10);
    const server = app.listen(PORT, () => {
        console.log(`✓ Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    });
    // Graceful shutdown
    process.on("SIGTERM", () => {
        console.log("SIGTERM received — shutting down gracefully");
        server.close(() => process.exit(0));
    });
    process.on("unhandledRejection", (err) => {
        console.error("Unhandled rejection:", err.message);
        server.close(() => process.exit(1));
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map