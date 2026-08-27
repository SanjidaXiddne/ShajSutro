"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const productSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
// Text index for search
productSchema.index({ name: "text", description: "text", tags: "text" });
// Compound index for common filter queries
productSchema.index({ category: 1, price: 1 });
productSchema.index({ badge: 1 });
const Product = mongoose_1.default.model("Product", productSchema);
exports.default = Product;
//# sourceMappingURL=Product.js.map