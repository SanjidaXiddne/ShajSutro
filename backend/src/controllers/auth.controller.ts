import { Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User";
import PendingUser from "../models/PendingUser";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../types";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService";

const generateVerificationCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── Helper: generate JWT ────────────────────────────────────────────────────

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
  if (!secret) throw new AppError("JWT_SECRET not configured", 500);
  return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export const register = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    if (!name || !email || !password) {
      throw new AppError("Please provide name, email, and password", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[REGISTER REQUEST RECEIVED] Name: "${name}", Email: "${normalizedEmail}"`);

    // Check if verified user already exists in main database
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (!existing.isEmailVerified) {
        const code = generateVerificationCode();
        existing.verificationCode = code;
        existing.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
        existing.verificationAttempts = 0;
        await existing.save();
        await sendVerificationEmail(normalizedEmail, code);
        res.status(200).json({
          success: true,
          message: "Verification code sent to your email. Please verify to complete account creation.",
          data: {
            name: existing.name,
            email: normalizedEmail,
            isEmailVerified: false,
          },
        });
        return;
      }
      throw new AppError("An account with that email already exists. Please sign in.", 400);
    }

    const code = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any previous pending registration attempt for this email
    await PendingUser.deleteMany({ email: normalizedEmail });

    // Store temporary data in PendingUser collection (Strictly user role only)
    await PendingUser.create({
      name,
      email: normalizedEmail,
      password,
      role: "user",
      verificationCode: code,
      verificationCodeExpiry: expiry,
      verificationAttempts: 0,
    });

    try {
      await sendVerificationEmail(normalizedEmail, code);
    } catch (mailErr: any) {
      console.warn("[Register Warning] Could not dispatch verification email via SMTP:", mailErr?.message || mailErr);
    }

    res.status(201).json({
      success: true,
      message: "Verification code sent to your email. Please verify to complete account creation.",
      data: {
        name,
        email: normalizedEmail,
        isEmailVerified: false,
      },
    });
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export const login = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.isBlocked) {
      throw new AppError("Your account has been blocked. Please contact support.", 403);
    }

    if (user.role !== "admin" && user.role !== "sub-admin" && !user.isEmailVerified) {
      throw new AppError("Please verify your email before logging in.", 403);
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
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
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
  }
);

// ─── GET /api/auth/addresses ──────────────────────────────────────────────────

export const getAddresses = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError("User not found", 404);

    res.status(200).json({
      success: true,
      data: user.addresses || [],
    });
  }
);

// ─── POST /api/auth/addresses ─────────────────────────────────────────────────

export const addAddress = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { label, firstName, lastName, phone, address, city, state, zip, country, isDefault } = req.body;
    if (!address || !address.trim()) {
      throw new AppError("Please enter your address", 400);
    }

    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError("User not found", 404);

    if (!user.addresses) user.addresses = [];

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
    } as any);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: user.addresses,
    });
  }
);

// ─── PUT /api/auth/addresses/:addressId ────────────────────────────────────────

export const updateAddress = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { addressId } = req.params;
    const { label, firstName, lastName, phone, address, city, state, zip, country, isDefault } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError("User not found", 404);

    const addrIndex = user.addresses?.findIndex((a: any) => a._id?.toString() === addressId);
    if (addrIndex === undefined || addrIndex === -1) {
      throw new AppError("Address not found", 404);
    }

    if (isDefault) {
      user.addresses?.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const currentAddr = user.addresses![addrIndex];
    if (label !== undefined) currentAddr.label = label;
    if (firstName !== undefined) currentAddr.firstName = firstName;
    if (lastName !== undefined) currentAddr.lastName = lastName;
    if (phone !== undefined) currentAddr.phone = phone;
    if (address !== undefined) currentAddr.address = address;
    if (city !== undefined) currentAddr.city = city;
    if (state !== undefined) currentAddr.state = state;
    if (zip !== undefined) currentAddr.zip = zip;
    if (country !== undefined) currentAddr.country = country;
    if (isDefault !== undefined) currentAddr.isDefault = isDefault;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: user.addresses,
    });
  }
);

// ─── DELETE /api/auth/addresses/:addressId ─────────────────────────────────────

export const deleteAddress = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { addressId } = req.params;

    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError("User not found", 404);

    const wasDefault = user.addresses?.find((a: any) => a._id?.toString() === addressId)?.isDefault;
    user.addresses = user.addresses?.filter((a: any) => a._id?.toString() !== addressId);

    if (wasDefault && user.addresses && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: user.addresses,
    });
  }
);

// ─── PUT /api/auth/addresses/:addressId/default ────────────────────────────────

export const setDefaultAddress = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { addressId } = req.params;

    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError("User not found", 404);

    if (user.addresses) {
      user.addresses.forEach((a: any) => {
        a.isDefault = a._id?.toString() === addressId;
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Default address set successfully",
      data: user.addresses,
    });
  }
);

// ─── PUT /api/auth/me ─────────────────────────────────────────────────────────

export const updateMe = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, email, phone } = req.body as { name?: string; email?: string; phone?: string };

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, email, phone },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: user,
    });
  }
);

// ─── PUT /api/auth/change-password ────────────────────────────────────────────

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      throw new AppError("Please provide current and new passwords", 400);
    }

    const user = await User.findById(req.user?._id).select("+password");
    if (!user) throw new AppError("User not found", 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError("Current password is incorrect", 400);

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  }
);

// ─── POST /api/auth/verify-email ──────────────────────────────────────────────

export const verifyEmail = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, code } = req.body as { email: string; code: string };

    if (!email || !code) {
      throw new AppError("Please provide email and verification code", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user is already verified and saved in main database
    const existingUser = await User.findOne({ email: normalizedEmail });
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
    const pending = await PendingUser.findOne({ email: normalizedEmail });
    if (!pending) {
      throw new AppError("No pending registration found for this email. Please sign up again.", 404);
    }

    if (new Date() > pending.verificationCodeExpiry) {
      await PendingUser.deleteOne({ _id: pending._id });
      throw new AppError("Verification code has expired. Please sign up again or request a new code.", 400);
    }

    const currentAttempts = pending.verificationAttempts || 0;
    if (currentAttempts >= 5) {
      await PendingUser.deleteOne({ _id: pending._id });
      throw new AppError("Too many incorrect attempts. Please sign up or request a new code.", 429);
    }

    if (pending.verificationCode !== code.trim()) {
      pending.verificationAttempts = currentAttempts + 1;
      await pending.save();
      const remaining = 5 - pending.verificationAttempts;
      throw new AppError(
        `Invalid verification code.${remaining > 0 ? ` ${remaining} attempt(s) remaining.` : " Please request a new code."}`,
        400
      );
    }

    // 🌟 OTP Verification Successful -> Save strictly as user role!
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      role: "user",
      isEmailVerified: true,
    });

    // Clean up pending registration record
    await PendingUser.deleteOne({ _id: pending._id });

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
  }
);

// ─── POST /api/auth/resend-verification ───────────────────────────────────────

export const resendVerificationCode = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email } = req.body as { email: string };

    if (!email) throw new AppError("Please provide an email", 400);

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[RESEND VERIFICATION REQUEST] Email: "${normalizedEmail}"`);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isEmailVerified) {
      throw new AppError("Email is already verified. Please sign in.", 400);
    }

    const code = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    const pending = await PendingUser.findOne({ email: normalizedEmail });
    if (pending) {
      pending.verificationCode = code;
      pending.verificationCodeExpiry = expiry;
      pending.verificationAttempts = 0;
      await pending.save();
    } else if (existingUser && !existingUser.isEmailVerified) {
      existingUser.verificationCode = code;
      existingUser.verificationCodeExpiry = expiry;
      existingUser.verificationAttempts = 0;
      await existingUser.save();
    } else {
      throw new AppError("No registration found for this email. Please sign up first.", 404);
    }

    try {
      await sendVerificationEmail(normalizedEmail, code);
    } catch (mailErr: any) {
      console.warn("[Resend Warning] Could not dispatch email via SMTP:", mailErr?.message || mailErr);
    }

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  }
);

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────

export const forgotPassword = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email } = req.body as { email: string };

    if (!email) throw new AppError("Please provide an email address", 400);

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[FORGOT PASSWORD REQUEST] Email: "${normalizedEmail}"`);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const pending = await PendingUser.findOne({ email: normalizedEmail });
      if (pending) {
        throw new AppError(
          "This account is pending email verification. Please verify your email from the Sign Up screen first.",
          400
        );
      }
      throw new AppError(
        "No account found with this email address. Please check your spelling or create a new account.",
        404
      );
    }

    const code = generateVerificationCode();
    user.passwordResetCode = code;
    user.passwordResetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetAttempts = 0;
    await user.save();

    console.log(`[AUTH RESET PASSWORD OTP] Generated code for ${user.email}: ${code}`);

    try {
      await sendPasswordResetEmail(user.email, code);
    } catch (mailErr: any) {
      console.warn("[Forgot Password Warning] Could not dispatch email via SMTP:", mailErr?.message || mailErr);
    }

    res.status(200).json({
      success: true,
      message: "A password reset code has been sent to your email.",
    });
  }
);

// ─── POST /api/auth/reset-password ────────────────────────────────────────────

export const resetPassword = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, code, newPassword } = req.body as {
      email: string;
      code: string;
      newPassword: string;
    };

    if (!email || !code || !newPassword) {
      throw new AppError("Please provide email, code, and new password", 400);
    }
    if (newPassword.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordResetCode +passwordResetCodeExpiry +passwordResetAttempts"
    );

    if (!user) throw new AppError("No account found with that email", 404);
    if (!user.passwordResetCode || !user.passwordResetCodeExpiry) {
      throw new AppError("No reset code found. Please request a new one.", 400);
    }
    if (new Date() > user.passwordResetCodeExpiry) {
      user.passwordResetCode = undefined;
      user.passwordResetCodeExpiry = undefined;
      user.passwordResetAttempts = 0;
      await user.save();
      throw new AppError("Reset code has expired. Please request a new one.", 400);
    }

    const attempts = user.passwordResetAttempts || 0;
    if (attempts >= 5) {
      user.passwordResetCode = undefined;
      user.passwordResetCodeExpiry = undefined;
      user.passwordResetAttempts = 0;
      await user.save();
      throw new AppError("Too many incorrect attempts. Please request a new password reset code.", 429);
    }

    if (user.passwordResetCode !== code.trim()) {
      user.passwordResetAttempts = attempts + 1;
      await user.save();
      const remaining = 5 - user.passwordResetAttempts;
      throw new AppError(
        `Invalid reset code.${remaining > 0 ? ` ${remaining} attempt(s) remaining.` : " Please request a new code."}`,
        400
      );
    }

    user.password = newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiry = undefined;
    user.passwordResetAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in.",
    });
  }
);

// ─── Helper: Verify Google Token ──────────────────────────────────────────────

import https from "https";
import crypto from "crypto";

const fetchJsonFromUrl = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch {
              reject(new Error("Failed to parse Google response"));
            }
          } else {
            reject(
              new Error(`Google verification failed with status code ${res.statusCode}`)
            );
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

const verifyGoogleToken = async (token: string): Promise<any> => {
  try {
    return await fetchJsonFromUrl(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );
  } catch {
    return await fetchJsonFromUrl(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
  }
};

// ─── POST /api/auth/google ────────────────────────────────────────────────────

export const googleLogin = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { accessToken, credential, idToken } = req.body as {
      accessToken?: string;
      credential?: string;
      idToken?: string;
    };
    const googleToken = accessToken || credential || idToken;

    if (!googleToken) {
      throw new AppError("Google token or credential is required", 400);
    }

    let googleUser;
    try {
      googleUser = await verifyGoogleToken(googleToken);
    } catch (err: any) {
      throw new AppError(err.message || "Invalid Google token", 400);
    }

    const { email, name, email_verified } = googleUser as {
      email: string;
      name: string;
      email_verified?: boolean;
    };

    if (!email) {
      throw new AppError("Could not retrieve email from Google", 400);
    }

    let user = await User.findOne({ email });

    if (user) {
      if (user.isBlocked) {
        throw new AppError(
          "Your account has been blocked. Please contact support.",
          403
        );
      }

      if (!user.isEmailVerified && email_verified) {
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      // Generate a secure random password to satisfy the DB schema constraints
      const randomPassword = crypto.randomBytes(32).toString("hex");

      user = await User.create({
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
  }
);

