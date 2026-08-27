import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Notification from "../models/Notification";
import { AppError } from "../middleware/error.middleware";

// ─── GET /api/notifications/active (Public Storefront) ───────────────────────
export const getActiveNotifications = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const notifications = await Notification.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  }
);

// ─── GET /api/notifications (Admin Only) ─────────────────────────────────────
export const getNotifications = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  }
);

// ─── POST /api/notifications (Admin Only) ────────────────────────────────────
export const createNotification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { title, message, type, image, link, buttonText, badgeText, promoCode, duration, isActive } = req.body;

    const hasTitle = Boolean(title && title.trim());
    const hasMessage = Boolean(message && message.trim());
    const hasImage = Boolean(image && image.trim());

    if (!hasTitle && !hasMessage && !hasImage) {
      throw new AppError("Notification content required (Title, Message, or Image)", 400);
    }

    const notification = await Notification.create({
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
  }
);

// ─── PUT /api/notifications/:id (Admin Only) ─────────────────────────────────
export const updateNotification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    const { title, message, type, image, link, buttonText, badgeText, promoCode, duration, isActive } = req.body;

    if (title !== undefined) notification.title = title;
    if (message !== undefined) notification.message = message;
    if (type !== undefined) notification.type = type;
    if (image !== undefined) notification.image = image;
    if (link !== undefined) notification.link = link;
    if (buttonText !== undefined) notification.buttonText = buttonText;
    if (badgeText !== undefined) notification.badgeText = badgeText;
    if (promoCode !== undefined) notification.promoCode = promoCode;
    if (duration !== undefined) notification.duration = duration;
    if (isActive !== undefined) notification.isActive = isActive;

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: notification,
    });
  }
);

// ─── DELETE /api/notifications/:id (Admin Only) ──────────────────────────────
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  }
);
