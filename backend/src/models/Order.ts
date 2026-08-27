import mongoose, { Schema } from "mongoose";
import { IOrderDocument } from "../types";

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"],
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const exchangeRequestSchema = new Schema(
  {
    requestedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    reason: { type: String, required: true },
    items: [
      {
        name: { type: String, required: true },
        size: { type: String },
        color: { type: String },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    adminNote: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr: unknown[]) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "cod"],
      required: true,
    },
    txnId: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending_verification", "pending_delivery", "paid", "refunded", "cancelled"],
      default: "pending_verification",
    },
    subtotal:     { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    tax:          { type: Number, required: true, default: 0 },
    discount:     { type: Number, required: true, default: 0 },
    promoCode:    { type: String, default: "" },
    total:        { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    exchangeRequest: {
      type: exchangeRequestSchema,
    },
  },
  { timestamps: true }
);

// Index for efficient user order lookups and status filtering
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model<IOrderDocument>("Order", orderSchema);
export default Order;
