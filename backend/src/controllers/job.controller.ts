import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AppError } from "../middleware/error.middleware";
import Job from "../models/Job";

// ─── GET /api/jobs  (public — only active) ────────────────────────────────────

export const getJobs = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  },
);

// ─── GET /api/jobs/all  (admin — all including inactive) ─────────────────────

export const getAllJobs = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  },
);

// ─── POST /api/jobs  (admin) ──────────────────────────────────────────────────

export const createJob = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      title,
      department,
      location,
      type,
      level,
      description,
      deadline,
      bullets,
      isActive,
    } = req.body as {
      title: string;
      department: string;
      location: string;
      type: string;
      level: string;
      description?: string;
      deadline?: string | null;
      bullets?: string[];
      isActive?: boolean;
    };

    if (!title || !department || !location || !type || !level) {
      throw new AppError(
        "title, department, location, type and level are required",
        400,
      );
    }

    const job = await Job.create({
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
  },
);

// ─── PUT /api/jobs/:id  (admin) ───────────────────────────────────────────────

export const updateJob = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) throw new AppError("Job not found", 404);
    res.status(200).json({ success: true, message: "Job updated", data: job });
  },
);

// ─── DELETE /api/jobs/:id  (admin) ────────────────────────────────────────────

export const deleteJob = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) throw new AppError("Job not found", 404);
    res.status(200).json({ success: true, message: "Job deleted" });
  },
);
