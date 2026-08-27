import mongoose, { Schema } from "mongoose";
import { IPromoCodeDocument } from "../types";

const promoCodeSchema = new Schema<IPromoCodeDocument>(
  {
    code: {
      type: String,
      required: [true, "Promo code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]{3,20}$/, "Code must be 3–20 alphanumeric characters"],
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: [0, "Value must be positive"],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    usageLimitPerUser: {
      type: Number,
      default: 1,
    },
    isFirstOrderOnly: {
      type: Boolean,
      default: false,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    usedByUsers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        email: { type: String, lowercase: true, trim: true },
        orderId: { type: Schema.Types.ObjectId, ref: "Order" },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const PromoCode = mongoose.model<IPromoCodeDocument>("PromoCode", promoCodeSchema);
export default PromoCode;
