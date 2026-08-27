"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect, auth_middleware_1.adminOnly);
router.get("/stats", admin_controller_1.getDashboardStats);
router.get("/activity-alerts", admin_controller_1.getAdminActivityAlerts);
router.get("/team", auth_middleware_1.rootAdminOnly, admin_controller_1.getAllAdminUsers);
// Subscriber management
router.get("/subscribers", admin_controller_1.getSubscribers);
router.post("/subscribers/broadcast", admin_controller_1.broadcastSubscribersEmail);
router.delete("/subscribers/:id", admin_controller_1.deleteSubscriber);
router.patch("/subscribers/:id/toggle", admin_controller_1.toggleSubscriberStatus);
// Product management (admin view — includes hidden products)
router.get("/products", admin_controller_1.getAdminProducts);
// User management
router.get("/users", admin_controller_1.getAllUsers);
router.get("/users/:id", admin_controller_1.getUserDetails);
router.post("/users", admin_controller_1.createUser);
router.put("/users/:id", admin_controller_1.updateUser);
router.put("/users/:id/permissions", auth_middleware_1.rootAdminOnly, admin_controller_1.updateAdminPermissions);
router.put("/users/:id/block", admin_controller_1.blockUser);
router.delete("/users/:id", admin_controller_1.deleteUser);
// Order management
router.get("/orders", admin_controller_1.getAllOrders);
router.get("/orders/:id", admin_controller_1.getOrderDetails);
router.put("/orders/:id/status", admin_controller_1.updateOrderStatus);
router.put("/orders/:id/confirm-payment", admin_controller_1.confirmPayment);
router.put("/orders/:id/refund-payment", admin_controller_1.refundPayment);
router.put("/orders/:id/exchange", admin_controller_1.updateExchangeStatus);
// Contact messages
router.get("/messages", admin_controller_1.getAllContactMessages);
router.put("/messages/:id/read", admin_controller_1.markContactMessageRead);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map