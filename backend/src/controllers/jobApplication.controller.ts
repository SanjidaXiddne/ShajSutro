import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AppError } from "../middleware/error.middleware";
import Job from "../models/Job";
import JobApplication from "../models/JobApplication";

function publicCvUrl(req: Request, filename: string) {
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/cv/${encodeURIComponent(filename)}`;
}

// ─── POST /api/job-applications  (public) ─────────────────────────────────────
export const createJobApplication = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { jobId, name, email, phone, note } = req.body as {
      jobId?: string;
      name?: string;
      email?: string;
      phone?: string;
      note?: string;
    };

    const file = (req as Request & { file?: Express.Multer.File }).file;

    if (!jobId || !name || !email || !phone) {
      throw new AppError("jobId, name, email, phone are required", 400);
    }
    if (!file) {
      throw new AppError("CV file is required", 400);
    }

    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      throw new AppError("Job not found", 404);
    }

    const application = await JobApplication.create({
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
  }
);

// ─── GET /api/job-applications/all  (admin) ───────────────────────────────────
export const getAllJobApplications = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const apps = await JobApplication.find()
      .populate("job", "title department location type level isActive")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: apps });
  }
);

