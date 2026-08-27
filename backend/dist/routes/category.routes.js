"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", category_controller_1.getCategories);
router.get("/:id/subcategories", category_controller_1.getSubcategories);
router.get("/:slug", category_controller_1.getCategoryBySlug);
router.post("/", auth_middleware_1.protect, auth_middleware_1.adminOnly, category_controller_1.createCategory);
router.put("/:id", auth_middleware_1.protect, auth_middleware_1.adminOnly, category_controller_1.updateCategory);
router.delete("/:id", auth_middleware_1.protect, auth_middleware_1.adminOnly, category_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map