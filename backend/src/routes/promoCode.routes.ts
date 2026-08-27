import { Router } from "express";
import {
  getAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  applyPromoCode,
} from "../controllers/promoCode.controller";
import { protect, adminOnly, optionalProtect } from "../middleware/auth.middleware";

const router = Router();

// Validate/apply promo code (checks user first order / usage limits if token provided)
router.post("/apply", optionalProtect, applyPromoCode);

// Admin only — CRUD
router.use(protect, adminOnly);
router.get("/", getAllPromoCodes);
router.post("/", createPromoCode);
router.put("/:id", updatePromoCode);
router.delete("/:id", deletePromoCode);

export default router;
