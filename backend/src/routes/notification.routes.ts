import { Router } from "express";
import {
  getActiveNotifications,
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
} from "../controllers/notification.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

// Public endpoint for storefront
router.get("/active", getActiveNotifications);

// Admin protected endpoints
router.get("/", protect, adminOnly, getNotifications);
router.post("/", protect, adminOnly, createNotification);
router.put("/:id", protect, adminOnly, updateNotification);
router.delete("/:id", protect, adminOnly, deleteNotification);

export default router;
