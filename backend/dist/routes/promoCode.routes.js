"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promoCode_controller_1 = require("../controllers/promoCode.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public — anyone can validate/apply a promo code
router.post("/apply", promoCode_controller_1.applyPromoCode);
// Admin only — CRUD
router.use(auth_middleware_1.protect, auth_middleware_1.adminOnly);
router.get("/", promoCode_controller_1.getAllPromoCodes);
router.post("/", promoCode_controller_1.createPromoCode);
router.put("/:id", promoCode_controller_1.updatePromoCode);
router.delete("/:id", promoCode_controller_1.deletePromoCode);
exports.default = router;
//# sourceMappingURL=promoCode.routes.js.map