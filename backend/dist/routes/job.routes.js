"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_1 = require("../controllers/job.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", job_controller_1.getJobs); // public (active only)
router.get("/all", auth_middleware_1.protect, auth_middleware_1.adminOnly, job_controller_1.getAllJobs); // admin (all)
router.post("/", auth_middleware_1.protect, auth_middleware_1.adminOnly, job_controller_1.createJob);
router.put("/:id", auth_middleware_1.protect, auth_middleware_1.adminOnly, job_controller_1.updateJob);
router.delete("/:id", auth_middleware_1.protect, auth_middleware_1.adminOnly, job_controller_1.deleteJob);
exports.default = router;
//# sourceMappingURL=job.routes.js.map