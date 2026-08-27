import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getOrderInvoice,
  requestExchange,
  trackOrder,
} from "../controllers/order.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Public route for order tracking (no login required)
router.post("/track", trackOrder);

// All other order routes require authentication
router.use(protect);

router.post("/", placeOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrder);
router.get("/:id/invoice", getOrderInvoice);
router.put("/:id/cancel", cancelOrder);
router.post("/:id/exchange", requestExchange);

export default router;
