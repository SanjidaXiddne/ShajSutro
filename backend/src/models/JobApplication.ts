import mongoose, { Schema } from "mongoose";

export interface IJobApplicationDocument extends mongoose.Document {
  job: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  cvUrl: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplicationDocument>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      maxlength: 40,
    },
    cvUrl: {
      type: String,
      required: [true, "CV file is required"],
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { timestamps: true }
);

const JobApplication = mongoose.model<IJobApplicationDocument>(
  "JobApplication",
  jobApplicationSchema
);

export default JobApplication;

