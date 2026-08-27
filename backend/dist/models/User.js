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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const addressSchema = new mongoose_1.Schema({
    label: { type: String, default: "Home" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, required: true },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    country: { type: String, default: "Bangladesh" },
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
        type: String,
        default: "",
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin", "sub-admin"],
        default: "user",
    },
    adminRole: {
        type: String,
        enum: ["root_admin", "sub_admin"],
        default: "root_admin",
    },
    permissions: {
        dashboard: { type: Boolean, default: true },
        products: { type: Boolean, default: true },
        orders: { type: Boolean, default: true },
        users: { type: Boolean, default: true },
        categories: { type: Boolean, default: true },
        promoCodes: { type: Boolean, default: true },
        notifications: { type: Boolean, default: true },
        jobs: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
    },
    addresses: [addressSchema],
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        select: false,
    },
    verificationCodeExpiry: {
        type: Date,
        select: false,
    },
    passwordResetCode: {
        type: String,
        select: false,
    },
    passwordResetCodeExpiry: {
        type: Date,
        select: false,
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },
    passwordChangedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });
// Hash password before saving & update passwordChangedAt timestamp
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    if (!this.isNew) {
        this.passwordChangedAt = new Date();
    }
    const salt = await bcryptjs_1.default.genSalt(12);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map