import mongoose, { Document, Schema } from "mongoose";

export interface ISubscriber {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscriberDocument extends ISubscriber, Document {}

const subscriberSchema = new Schema<ISubscriberDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

subscriberSchema.index({ email: 1 });

const Subscriber = mongoose.model<ISubscriberDocument>("Subscriber", subscriberSchema);
export default Subscriber;
