import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUserDocument } from "../types";

const addressSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

const userSchema = new Schema<IUserDocument>(
  {
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
    verificationAttempts: {
      type: Number,
      default: 0,
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
    passwordResetAttempts: {
      type: Number,
      default: 0,
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
  },
  { timestamps: true }
);

// Hash password before saving & update passwordChangedAt timestamp
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUserDocument>("User", userSchema);
export default User;
