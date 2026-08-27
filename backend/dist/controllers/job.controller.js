"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.updateJob = exports.createJob = exports.getAllJobs = exports.getJobs = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const error_middleware_1 = require("../middleware/error.middleware");
const Job_1 = __importDefault(require("../models/Job"));
// ─── GET /api/jobs  (public — only active) ────────────────────────────────────
exports.getJobs = (0, express_async_handler_1.default)(async (_req, res) => {
    const jobs = await Job_1.default.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
});
// ─── GET /api/jobs/all  (admin — all including inactive) ─────────────────────
exports.getAllJobs = (0, express_async_handler_1.default)(async (_req, res) => {
    const jobs = await Job_1.default.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
});
// ─── POST /api/jobs  (admin) ──────────────────────────────────────────────────
exports.createJob = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, department, location, type, level, description, deadline, bullets, isActive, } = req.body;
    if (!title || !department || !location || !type || !level) {
        throw new error_middleware_1.AppError("title, department, location, type and level are required", 400);
    }
    const job = await Job_1.default.create({
        title,
        department,
        location,
        type,
        level,
        description: description ?? "",
        deadline: deadline ? new Date(deadline) : null,
        bullets: bullets ?? [],
        isActive: isActive ?? true,
    });
    res.status(201).json({ success: true, message: "Job created", data: job });
});
// ─── PUT /api/jobs/:id  (admin) ───────────────────────────────────────────────
exports.updateJob = (0, express_async_handler_1.default)(async (req, res) => {
    const job = await Job_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!job)
        throw new error_middleware_1.AppError("Job not found", 404);
    res.status(200).json({ success: true, message: "Job updated", data: job });
});
// ─── DELETE /api/jobs/:id  (admin) ────────────────────────────────────────────
exports.deleteJob = (0, express_async_handler_1.default)(async (req, res) => {
    const job = await Job_1.default.findByIdAndDelete(req.params.id);
    if (!job)
        throw new error_middleware_1.AppError("Job not found", 404);
    res.status(200).json({ success: true, message: "Job deleted" });
});
//# sourceMappingURL=job.controller.js.map