"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/google", auth_controller_1.googleLogin);
router.post("/verify-email", auth_controller_1.verifyEmail);
router.post("/resend-verification", auth_controller_1.resendVerificationCode);
router.post("/forgot-password", auth_controller_1.forgotPassword);
router.post("/reset-password", auth_controller_1.resetPassword);
router.get("/me", auth_middleware_1.protect, auth_controller_1.getMe);
router.put("/me", auth_middleware_1.protect, auth_controller_1.updateMe);
router.put("/change-password", auth_middleware_1.protect, auth_controller_1.changePassword);
// Address management routes
router.get("/addresses", auth_middleware_1.protect, auth_controller_1.getAddresses);
router.post("/addresses", auth_middleware_1.protect, auth_controller_1.addAddress);
router.put("/addresses/:addressId", auth_middleware_1.protect, auth_controller_1.updateAddress);
router.delete("/addresses/:addressId", auth_middleware_1.protect, auth_controller_1.deleteAddress);
router.put("/addresses/:addressId/default", auth_middleware_1.protect, auth_controller_1.setDefaultAddress);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map