import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { AppError } from "../middleware/error.middleware";
import ContactMessage from "../models/ContactMessage";

export const createContactMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { topic, name, email, subject, message } = req.body as {
      topic?: "general" | "order" | "returns" | "sizing" | "press";
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!name || !email || !subject || !message) {
      throw new AppError("Name, email, subject, and message are required", 400);
    }

    const saved = await ContactMessage.create({
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
  },
);
