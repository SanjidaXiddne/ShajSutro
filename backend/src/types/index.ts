import { Request } from "express";
import { Document, Types } from "mongoose";

// ─── Extended Express Request ─────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: IUserDocument;
}

// ─── User & Admin Permissions ───────────────────────────────────────────────

export interface IAdminPermissions {
  dashboard: boolean;
  products: boolean;
  orders: boolean;
  users: boolean;
  categories: boolean;
  promoCodes: boolean;
  notifications: boolean;
  jobs: boolean;
  messages: boolean;
}

export interface IUserAddress {
  _id?: Types.ObjectId | string;
  label?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isDefault?: boolean;
}

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "user" | "admin" | "sub-admin";
  adminRole?: "root_admin" | "sub_admin";
  permissions?: IAdminPermissions;
  addresses?: IUserAddress[];
  isBlocked: boolean;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  verificationAttempts?: number;
  passwordResetCode?: string;
  passwordResetCodeExpiry?: Date;
  passwordResetAttempts?: number;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: Types.ObjectId;
  createdAt?: Date;
}

export interface ICategoryDocument extends ICategory, Document {
  _id: Types.ObjectId;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Types.ObjectId;
  images: string[];
  sizes: string[];
  colors: string[];
  badge?: "New" | "Sale" | "Best Seller";
  rating: number;
  reviews: number;
  inStock: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  stock: number;
  totalOrdered: number;
  tags: string[];
  sku?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  size: string;
  color: string;
}

export interface ICart {
  user: Types.ObjectId;
  items: ICartItem[];
  updatedAt?: Date;
}

export interface ICartDocument extends ICart, Document {
  _id: Types.ObjectId;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface IOrderItem {
  product?: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IOrderExchangeRequestItem {
  name: string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface IOrderExchangeRequest {
  requestedAt: Date;
  status: "pending" | "approved" | "rejected" | "completed";
  reason: string;
  items: IOrderExchangeRequestItem[];
  adminNote?: string;
}

export interface IOrderStatusHistory {
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  updatedAt: Date;
  note?: string;
}

export interface IOrder {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: "bkash" | "nagad" | "rocket" | "cod";
  txnId?: string;
  paymentStatus: "pending_verification" | "pending_delivery" | "paid" | "refunded" | "cancelled";
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  promoCode?: string;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  statusHistory?: IOrderStatusHistory[];
  exchangeRequest?: IOrderExchangeRequest;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
}

// ─── Promo Code ───────────────────────────────────────────────────────────────

export interface IPromoCodeUserUsage {
  userId?: Types.ObjectId;
  email?: string;
  orderId?: Types.ObjectId;
  usedAt: Date;
}

export interface IPromoCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  maxUses: number | null;
  usageLimitPerUser?: number | null;
  isFirstOrderOnly?: boolean;
  usedCount: number;
  usedByUsers?: IPromoCodeUserUsage[];
  isActive: boolean;
  expiresAt: Date | null;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPromoCodeDocument extends IPromoCode, Document {
  _id: Types.ObjectId;
}

// ─── Job ──────────────────────────────────────────────────────────────────────

export interface IJob {
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  level: "Junior" | "Mid" | "Senior" | "Lead";
  description?: string;
  deadline?: Date;
  bullets: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJobDocument extends IJob, Document {
  _id: Types.ObjectId;
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface INotification {
  title?: string;
  message?: string;
  type: "discount" | "special_offer" | "announcement" | "product_discount" | "hero_banner";
  image?: string;
  link?: string;
  buttonText?: string;
  badgeText?: string;
  promoCode?: string;
  duration?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotificationDocument extends INotification, Document {
  _id: Types.ObjectId;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
