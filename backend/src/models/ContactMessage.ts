import mongoose, { Document, Schema } from "mongoose";

interface IContactMessageDocument extends Document {
  topic: "general" | "order" | "returns" | "sizing" | "press";
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const contactMessageSchema = new Schema<IContactMessageDocument>(
  {
    topic: {
      type: String,
      enum: ["general", "order", "returns", "sizing", "press"],
      default: "general",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ isRead: 1, createdAt: -1 });

const ContactMessage = mongoose.model<IContactMessageDocument>(
  "ContactMessage",
  contactMessageSchema,
);

export default ContactMessage;
