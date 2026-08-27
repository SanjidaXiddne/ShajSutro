"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public endpoint for storefront
router.get("/active", notification_controller_1.getActiveNotifications);
// Admin protected endpoints
router.get("/", auth_middleware_1.protect, auth_middleware_1.adminOnly, notification_controller_1.getNotifications);
router.post("/", auth_middleware_1.protect, auth_middleware_1.adminOnly, notification_controller_1.createNotification);
router.put("/:id", auth_middleware_1.protect, auth_middleware_1.adminOnly, notification_controller_1.updateNotification);
router.delete("/:id", auth_middleware_1.protect, auth_middleware_1.adminOnly, notification_controller_1.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map