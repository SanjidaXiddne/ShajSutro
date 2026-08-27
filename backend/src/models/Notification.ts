import mongoose, { Schema } from "mongoose";
import { INotificationDocument } from "../types";

const notificationSchema = new Schema<INotificationDocument>(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["discount", "special_offer", "announcement", "product_discount", "hero_banner"],
      default: "special_offer",
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    buttonText: {
      type: String,
      trim: true,
      default: "",
    },
    badgeText: {
      type: String,
      trim: true,
      default: "",
    },
    promoCode: {
      type: String,
      trim: true,
      default: "",
    },
    duration: {
      type: Number,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotificationDocument>(
  "Notification",
  notificationSchema
);

export default Notification;
