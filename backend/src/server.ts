import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db";
import { errorHandler, notFound } from "./middleware/error.middleware";

// ─── Route imports ────────────────────────────────────────────────────────────
import fs from "fs";
import os from "os";
import path from "path";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import categoryRoutes from "./routes/category.routes";
import contactRoutes from "./routes/contact.routes";
import jobRoutes from "./routes/job.routes";
import jobApplicationRoutes from "./routes/jobApplication.routes";
import notificationRoutes from "./routes/notification.routes";
import orderRoutes from "./routes/order.routes";
import productRoutes from "./routes/product.routes";
import promoCodeRoutes from "./routes/promoCode.routes";
import reviewRoutes from "./routes/review.routes";
import statsRoutes from "./routes/stats.routes";
import newsletterRoutes from "./routes/newsletter.routes";
import { ensureWelcomePromoCode } from "./controllers/promoCode.controller";

// ─── Connect to MongoDB Atlas ─────────────────────────────────────────────────
connectDB().then(() => {
  ensureWelcomePromoCode().catch(() => {});
});

// ─── Express app setup ────────────────────────────────────────────────────────
const app = express();

// Trust reverse proxies (Vercel, Nginx, Cloudflare) for accurate client IP rate limiting
app.set("trust proxy", 1);

// HTTP Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // 25 attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/verify-email", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/orders/track", authLimiter);

// CORS — allow localhost, *.vercel.app, and any origins in CLIENT_URL (comma-separated)
const allowedOrigins = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any localhost / 127.0.0.1 or local LAN IP (e.g. 192.168.x.x, 10.x.x.x for mobile testing) regardless of port
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/i.test(
          origin
        )
      ) {
        return callback(null, true);
      }
      // Allow all Vercel deployment URLs (*.vercel.app)
      if (/^https:\/\/[^.]+\.vercel\.app$/i.test(origin)) {
        return callback(null, true);
      }
      // Allow any explicitly listed origin
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Default: allow origin
      return callback(null, true);
    },
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads (CV files)
const isServerless = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
);
const uploadsBaseDir = isServerless ? os.tmpdir() : process.cwd();
const uploadsPath = path.join(uploadsBaseDir, "uploads");

try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
} catch {
  // Ignore filesystem error in read-only environment
}

app.use("/uploads", express.static(uploadsPath));

// ─── Global Request Logger ───────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

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
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/promo-codes", promoCodeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/job-applications", jobApplicationRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/notifications", notificationRoutes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  const PORT = parseInt(process.env.PORT ?? "4000", 10);
  const server = app.listen(PORT, () => {
    console.log(
      `✓ Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`,
    );
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received — shutting down gracefully");
    server.close(() => process.exit(0));
  });

  process.on("unhandledRejection", (err: Error) => {
    console.error("Unhandled rejection:", err.message);
    server.close(() => process.exit(1));
  });
}

export default app;
