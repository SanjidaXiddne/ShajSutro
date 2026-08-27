"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public route for order tracking (no login required)
router.post("/track", order_controller_1.trackOrder);
// All other order routes require authentication
router.use(auth_middleware_1.protect);
router.post("/", order_controller_1.placeOrder);
router.get("/", order_controller_1.getMyOrders);
router.get("/:id", order_controller_1.getOrder);
router.get("/:id/invoice", order_controller_1.getOrderInvoice);
router.put("/:id/cancel", order_controller_1.cancelOrder);
router.post("/:id/exchange", order_controller_1.requestExchange);
exports.default = router;
//# sourceMappingURL=order.routes.js.map