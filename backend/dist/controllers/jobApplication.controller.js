"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllJobApplications = exports.createJobApplication = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const error_middleware_1 = require("../middleware/error.middleware");
const Job_1 = __importDefault(require("../models/Job"));
const JobApplication_1 = __importDefault(require("../models/JobApplication"));
function publicCvUrl(req, filename) {
    const base = `${req.protocol}://${req.get("host")}`;
    return `${base}/uploads/cv/${encodeURIComponent(filename)}`;
}
// ─── POST /api/job-applications  (public) ─────────────────────────────────────
exports.createJobApplication = (0, express_async_handler_1.default)(async (req, res) => {
    const { jobId, name, email, phone, note } = req.body;
    const file = req.file;
    if (!jobId || !name || !email || !phone) {
        throw new error_middleware_1.AppError("jobId, name, email, phone are required", 400);
    }
    if (!file) {
        throw new error_middleware_1.AppError("CV file is required", 400);
    }
    const job = await Job_1.default.findById(jobId);
    if (!job || !job.isActive) {
        throw new error_middleware_1.AppError("Job not found", 404);
    }
    const application = await JobApplication_1.default.create({
        job: job._id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        cvUrl: publicCvUrl(req, file.filename),
        note: note?.trim() ?? "",
    });
    res.status(201).json({
        success: true,
        message: "Application submitted",
        data: application,
    });
});
// ─── GET /api/job-applications/all  (admin) ───────────────────────────────────
exports.getAllJobApplications = (0, express_async_handler_1.default)(async (_req, res) => {
    const apps = await JobApplication_1.default.find()
        .populate("job", "title department location type level isActive")
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: apps });
});
//# sourceMappingURL=jobApplication.controller.js.map