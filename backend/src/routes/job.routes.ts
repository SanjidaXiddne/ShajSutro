import { Router } from "express";
import {
  createJob,
  deleteJob,
  getAllJobs,
  getJobs,
  updateJob,
} from "../controllers/job.controller";
import { adminOnly, protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getJobs); // public (active only)
router.get("/all", protect, adminOnly, getAllJobs); // admin (all)
router.post("/", protect, adminOnly, createJob);
router.put("/:id", protect, adminOnly, updateJob);
router.delete("/:id", protect, adminOnly, deleteJob);

export default router;
