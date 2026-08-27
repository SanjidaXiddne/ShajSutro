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
const orderItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: false,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    image: { type: String, default: "" },
}, { _id: false });
const shippingAddressSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
}, { _id: false });
const statusHistorySchema = new mongoose_1.Schema({
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
}, { _id: false });
const exchangeRequestSchema = new mongoose_1.Schema({
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
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: (arr) => arr.length > 0,
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
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    promoCode: { type: String, default: "" },
    total: { type: Number, required: true },
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
}, { timestamps: true });
// Index for efficient user order lookups and status filtering
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
const Order = mongoose_1.default.model("Order", orderSchema);
exports.default = Order;
//# sourceMappingURL=Order.js.map