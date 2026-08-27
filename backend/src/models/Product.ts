import mongoose, { Schema } from "mongoose";
import { IProductDocument } from "../types";

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price must be a positive number"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    badge: {
      type: String,
      enum: ["New", "Sale", "Best Seller"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    totalOrdered: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
    },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: "text", description: "text", tags: "text", sku: "text" });

// Compound index for common filter queries
productSchema.index({ category: 1, price: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ badge: 1 });

const Product = mongoose.model<IProductDocument>("Product", productSchema);
export default Product;
