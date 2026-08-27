import mongoose, { Schema } from "mongoose";
import { IJobDocument } from "../types";

const jobSchema = new Schema<IJobDocument>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: [true, "Job type is required"],
    },
    level: {
      type: String,
      enum: ["Junior", "Mid", "Senior", "Lead"],
      required: [true, "Level is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    deadline: {
      type: Date,
      default: null,
    },
    bullets: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Job = mongoose.model<IJobDocument>("Job", jobSchema);
export default Job;
