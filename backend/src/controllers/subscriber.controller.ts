import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Subscriber from "../models/Subscriber";
import { AppError } from "../middleware/error.middleware";
import { sendNewsletterWelcomeEmail } from "../services/emailService";

// ─── POST /api/newsletter/subscribe ───────────────────────────────────────────

export const subscribeNewsletter = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as { email: string };

    if (!email || !email.trim()) {
      throw new AppError("Email address is required", 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new AppError("Please enter a valid email address", 400);
    }

    let subscriber = await Subscriber.findOne({ email: cleanEmail });

    if (subscriber) {
      if (subscriber.isActive) {
        // Send / resend VIP welcome email so the user receives the email in their inbox
        sendNewsletterWelcomeEmail(cleanEmail).catch((err) => {
          console.error("Newsletter welcome email error:", err);
        });

        res.status(200).json({
          success: true,
          message: "You are already subscribed! We have sent your VIP welcome email.",
          data: subscriber,
        });
        return;
      } else {
        subscriber.isActive = true;
        subscriber.subscribedAt = new Date();
        await subscriber.save();
      }
    } else {
      subscriber = await Subscriber.create({
        email: cleanEmail,
        isActive: true,
        subscribedAt: new Date(),
      });
    }

    // Send welcome email asynchronously
    sendNewsletterWelcomeEmail(cleanEmail).catch((err) => {
      console.error("Newsletter welcome email error:", err);
    });

    res.status(201).json({
      success: true,
      message: "Subscribed successfully! Welcome to ShajSutro VIP.",
      data: subscriber,
    });
  }
);
