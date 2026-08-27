import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

import {
  createJobApplication,
  getAllJobApplications,
} from "../controllers/jobApplication.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

const getUploadDir = (): string => {
  const isServerless = Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  );
  const baseDir = isServerless ? os.tmpdir() : process.cwd();
  const uploadDir = path.join(baseDir, "uploads", "cv");

  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  } catch (err) {
    console.warn("Could not create upload directory, falling back to temp dir:", err);
    const tmpDir = path.join(os.tmpdir(), "uploads", "cv");
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {
      // Ignore failure in read-only environment
    }
    return tmpDir;
  }
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PDF/DOC/DOCX files are allowed"));
    }
    cb(null, true);
  },
});

router.post("/", upload.single("cv"), createJobApplication);
router.get("/all", protect, adminOnly, getAllJobApplications);

export default router;

