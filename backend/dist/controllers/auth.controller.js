"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.resetPassword = exports.forgotPassword = exports.resendVerificationCode = exports.verifyEmail = exports.changePassword = exports.updateMe = exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getAddresses = exports.getMe = exports.login = exports.register = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const PendingUser_1 = __importDefault(require("../models/PendingUser"));
const error_middleware_1 = require("../middleware/error.middleware");
const emailService_1 = require("../services/emailService");
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();
// ─── Helper: generate JWT ────────────────────────────────────────────────────
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
    if (!secret)
        throw new error_middleware_1.AppError("JWT_SECRET not configured", 500);
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn });
};
// ─── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        throw new error_middleware_1.AppError("Please provide name, email, and password", 400);
    }
    const normalizedEmail = email.toLowerCase().trim();
    // Check if verified user already exists in main database
    const existing = await User_1.default.findOne({ email: normalizedEmail });
    if (existing) {
        throw new error_middleware_1.AppError("An account with that email already exists", 400);
    }
    const code = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    // Delete any previous pending registration attempt for this email
    await PendingUser_1.default.deleteMany({ email: normalizedEmail });
    // Store temporary data in PendingUser collection (Do NOT save to User DB collection yet!)
    await PendingUser_1.default.create({
        name,
        email: normalizedEmail,
        password,
        role: role ?? "user",
        verificationCode: code,
        verificationCodeExpiry: expiry,
    });
    await (0, emailService_1.sendVerificationEmail)(normalizedEmail, code);
    res.status(201).json({
        success: true,
        message: "Verification code sent to your email. Please verify to complete account creation.",
        data: {
            name,
            email: normalizedEmail,
            isEmailVerified: false,
        },
    });
});
// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new error_middleware_1.AppError("Please provide email and password", 400);
    }
    const user = await User_1.default.findOne({ email }).select("+password");
    if (!user) {
        throw new error_middleware_1.AppError("Invalid email or password", 401);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new error_middleware_1.AppError("Invalid email or password", 401);
    }
    if (user.isBlocked) {
        throw new error_middleware_1.AppError("Your account has been blocked. Please contact support.", 403);
    }
    if (user.role !== "admin" && user.role !== "sub-admin" && !user.isEmailVerified) {
        throw new error_middleware_1.AppError("Please verify your email before logging in.", 403);
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = generateToken(user._id.toString());
    res.status(200).json({
        success: true,
        message: "Logged in successfully",
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});
// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = (0, express_async_handler_1.default)(async (req, res) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        data: {
            id: user?._id,
            name: user?.name,
            email: user?.email,
            phone: user?.phone || "",
            role: user?.role,
            addresses: user?.addresses || [],
            createdAt: user?.createdAt,
        },
    });
});
// ─── GET /api/auth/addresses ──────────────────────────────────────────────────
exports.getAddresses = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.user?._id);
    if (!user)
        throw new error_middleware_1.AppError("User not found", 404);
    res.status(200).json({
        success: true,
        data: user.addresses || [],
    });
});
// ─── POST /api/auth/addresses ─────────────────────────────────────────────────
exports.addAddress = (0, express_async_handler_1.default)(async (req, res) => {
    const { label, firstName, lastName, phone, address, city, state, zip, country, isDefault } = req.body;
    if (!address || !address.trim()) {
        throw new error_middleware_1.AppError("Please enter your address", 400);
    }
    const user = await User_1.default.findById(req.user?._id);
    if (!user)
        throw new error_middleware_1.AppError("User not found", 404);
    if (!user.addresses)
        user.addresses = [];
    const shouldBeDefault = isDefault || user.addresses.length === 0;
    if (shouldBeDefault) {
        user.addresses.forEach((addr) => {
            addr.isDefault = false;
        });
    }
    user.addresses.push({
        label: label || "Home",
        firstName: firstName || "",
        lastName: lastName || "",
        phone: phone || "",
        address: address.trim(),
        city: city || "",
        state: state || "",
        zip: zip || "",
        country: country || "Bangladesh",
        isDefault: shouldBeDefault,
    });
    await user.save();
    res.status(201).json({
        success: true,
        message: "Address added successfully",
        data: user.addresses,
    });
});
// ─── PUT /api/auth/addresses/:addressId ────────────────────────────────────────
exports.updateAddress = (0, express_async_handler_1.default)(async (req, res) => {
    const { addressId } = req.params;
    const { label, firstName, lastName, phone, address, city, state, zip, country, isDefault } = req.body;
    const user = await User_1.default.findById(req.user?._id);
    if (!user)
        throw new error_middleware_1.AppError("User not found", 404);
    const addrIndex = user.addresses?.findIndex((a) => a._id?.toString() === addressId);
    if (addrIndex === undefined || addrIndex === -1) {
        throw new error_middleware_1.AppError("Address not found", 404);
    }
    if (isDefault) {
        user.addresses?.forEach((addr) => {
            addr.isDefault = false;
        });
    }
    const currentAddr = user.addresses[addrIndex];
    if (label !== undefined)
        currentAddr.label = label;
    if (firstName !== undefined)
        currentAddr.firstName = firstName;
    if (lastName !== undefined)
        currentAddr.lastName = lastName;
    if (phone !== undefined)
        currentAddr.phone = phone;
    if (address !== undefined)
        currentAddr.address = address;
    if (city !== undefined)
        currentAddr.city = city;
    if (state !== undefined)
        currentAddr.state = state;
    if (zip !== undefined)
        currentAddr.zip = zip;
    if (country !== undefined)
        currentAddr.country = country;
    if (isDefault !== undefined)
        currentAddr.isDefault = isDefault;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Address updated successfully",
        data: user.addresses,
    });
});
// ─── DELETE /api/auth/addresses/:addressId ─────────────────────────────────────
exports.deleteAddress = (0, express_async_handler_1.default)(async (req, res) => {
    const { addressId } = req.params;
    const user = await User_1.default.findById(req.user?._id);
    if (!user)
        throw new error_middleware_1.AppError("User not found", 404);
    const wasDefault = user.addresses?.find((a) => a._id?.toString() === addressId)?.isDefault;
    user.addresses = user.addresses?.filter((a) => a._id?.toString() !== addressId);
    if (wasDefault && user.addresses && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }
    await user.save();
    res.status(200).json({
        success: true,
        message: "Address deleted successfully",
        data: user.addresses,
    });
});
// ─── PUT /api/auth/addresses/:addressId/default ────────────────────────────────
exports.setDefaultAddress = (0, express_async_handler_1.default)(async (req, res) => {
    const { addressId } = req.params;
    const user = await User_1.default.findById(req.user?._id);
    if (!user)
        throw new error_middleware_1.AppError("User not found", 404);
    if (user.addresses) {
        user.addresses.forEach((a) => {
            a.isDefault = a._id?.toString() === addressId;
        });
    }
    await user.save();
    res.status(200).json({
        success: true,
        message: "Default address set successfully",
        data: user.addresses,
    });
});
// ─── PUT /api/auth/me ─────────────────────────────────────────────────────────
exports.updateMe = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, phone } = req.body;
    const user = await User_1.default.findByIdAndUpdate(req.user?._id, { name, email, phone }, { new: true, runValidators: true });
    res.status(200).json({
        success: true,
        message: "Profile updated",
        data: user,
    });
});
// ─── PUT /api/auth/change-password ────────────────────────────────────────────
exports.changePassword = (0, express_async_handler_1.default)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new error_middleware_1.AppError("Please provide current and new passwords", 400);
    }
    const user = await User_1.default.findById(req.user?._id).select("+password");
    if (!user)
        throw new error_middleware_1.AppError("User not found", 404);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
        throw new error_middleware_1.AppError("Current password is incorrect", 400);
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});
// ─── POST /api/auth/verify-email ──────────────────────────────────────────────
exports.verifyEmail = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        throw new error_middleware_1.AppError("Please provide email and verification code", 400);
    }
    const normalizedEmail = email.toLowerCase().trim();
    // Check if user is already verified and saved in main database
    const existingUser = await User_1.default.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isEmailVerified) {
        const token = generateToken(existingUser._id.toString());
        res.status(200).json({
            success: true,
            message: "Email is already verified",
            token,
            data: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                isEmailVerified: true,
            },
        });
        return;
    }
    // Find pending registration
    const pending = await PendingUser_1.default.findOne({ email: normalizedEmail });
    if (!pending) {
        throw new error_middleware_1.AppError("No pending registration found for this email. Please sign up again.", 404);
    }
    if (new Date() > pending.verificationCodeExpiry) {
        throw new error_middleware_1.AppError("Verification code has expired. Please sign up again or request a new code.", 400);
    }
    if (pending.verificationCode !== code.trim()) {
        throw new error_middleware_1.AppError("Invalid verification code", 400);
    }
    // 🌟 OTP Verification Successful -> NOW save user to main User database collection!
    const user = await User_1.default.create({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        role: pending.role || "user",
        isEmailVerified: true,
    });
    // Clean up pending registration record
    await PendingUser_1.default.deleteOne({ _id: pending._id });
    const token = generateToken(user._id.toString());
    res.status(200).json({
        success: true,
        message: "Email verified & account created successfully",
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    });
});
// ─── POST /api/auth/resend-verification ───────────────────────────────────────
exports.resendVerificationCode = (0, express_async_handler_1.default)(async (req, res) => {
    const { email } = req.body;
    if (!email)
        throw new error_middleware_1.AppError("Please provide an email", 400);
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User_1.default.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isEmailVerified) {
        throw new error_middleware_1.AppError("Email is already verified", 400);
    }
    const pending = await PendingUser_1.default.findOne({ email: normalizedEmail });
    if (!pending) {
        throw new error_middleware_1.AppError("No pending registration found. Please sign up first.", 404);
    }
    const code = generateVerificationCode();
    pending.verificationCode = code;
    pending.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await pending.save();
    await (0, emailService_1.sendVerificationEmail)(normalizedEmail, code);
    res.status(200).json({
        success: true,
        message: "A new verification code has been sent to your email.",
    });
});
// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
exports.forgotPassword = (0, express_async_handler_1.default)(async (req, res) => {
    const { email } = req.body;
    if (!email)
        throw new error_middleware_1.AppError("Please provide an email address", 400);
    const user = await User_1.default.findOne({ email });
    // Always respond success to prevent email enumeration
    if (!user) {
        res.status(200).json({
            success: true,
            message: "If that email exists, a reset code has been sent.",
        });
        return;
    }
    const code = generateVerificationCode();
    user.passwordResetCode = code;
    user.passwordResetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await (0, emailService_1.sendPasswordResetEmail)(email, code);
    res.status(200).json({
        success: true,
        message: "A password reset code has been sent to your email.",
    });
});
// ─── POST /api/auth/reset-password ────────────────────────────────────────────
exports.resetPassword = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
        throw new error_middleware_1.AppError("Please provide email, code, and new password", 400);
    }
    if (newPassword.length < 6) {
        throw new error_middleware_1.AppError("Password must be at least 6 characters", 400);
    }
    const user = await User_1.default.findOne({ email }).select("+passwordResetCode +passwordResetCodeExpiry");
    if (!user)
        throw new error_middleware_1.AppError("No account found with that email", 404);
    if (!user.passwordResetCode || !user.passwordResetCodeExpiry) {
        throw new error_middleware_1.AppError("No reset code found. Please request a new one.", 400);
    }
    if (new Date() > user.passwordResetCodeExpiry) {
        throw new error_middleware_1.AppError("Reset code has expired. Please request a new one.", 400);
    }
    if (user.passwordResetCode !== code) {
        throw new error_middleware_1.AppError("Invalid reset code", 400);
    }
    user.password = newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiry = undefined;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password reset successfully. You can now sign in.",
    });
});
// ─── Helper: Verify Google Token ──────────────────────────────────────────────
const https_1 = __importDefault(require("https"));
const crypto_1 = __importDefault(require("crypto"));
const fetchJsonFromUrl = (url) => {
    return new Promise((resolve, reject) => {
        https_1.default
            .get(url, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch {
                        reject(new Error("Failed to parse Google response"));
                    }
                }
                else {
                    reject(new Error(`Google verification failed with status code ${res.statusCode}`));
                }
            });
        })
            .on("error", (err) => {
            reject(err);
        });
    });
};
const verifyGoogleToken = async (token) => {
    try {
        return await fetchJsonFromUrl(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    }
    catch {
        return await fetchJsonFromUrl(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    }
};
// ─── POST /api/auth/google ────────────────────────────────────────────────────
exports.googleLogin = (0, express_async_handler_1.default)(async (req, res) => {
    const { accessToken, credential, idToken } = req.body;
    const googleToken = accessToken || credential || idToken;
    if (!googleToken) {
        throw new error_middleware_1.AppError("Google token or credential is required", 400);
    }
    let googleUser;
    try {
        googleUser = await verifyGoogleToken(googleToken);
    }
    catch (err) {
        throw new error_middleware_1.AppError(err.message || "Invalid Google token", 400);
    }
    const { email, name, email_verified } = googleUser;
    if (!email) {
        throw new error_middleware_1.AppError("Could not retrieve email from Google", 400);
    }
    let user = await User_1.default.findOne({ email });
    if (user) {
        if (user.isBlocked) {
            throw new error_middleware_1.AppError("Your account has been blocked. Please contact support.", 403);
        }
        if (!user.isEmailVerified && email_verified) {
            user.isEmailVerified = true;
            await user.save();
        }
    }
    else {
        // Generate a secure random password to satisfy the DB schema constraints
        const randomPassword = crypto_1.default.randomBytes(32).toString("hex");
        user = await User_1.default.create({
            name: name || email.split("@")[0],
            email,
            password: randomPassword,
            isEmailVerified: email_verified ?? true,
        });
    }
    const token = generateToken(user._id.toString());
    res.status(200).json({
        success: true,
        message: "Logged in with Google successfully",
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});
//# sourceMappingURL=auth.controller.js.map