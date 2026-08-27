import { Router } from "express";
import {
  createReview,
  getMyReviews,
  getProductReviews,
} from "../controllers/review.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/mine", protect, getMyReviews);
router.post("/", protect, createReview);
router.get("/product/:productId", getProductReviews);

export default router;
