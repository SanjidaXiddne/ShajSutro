import mongoose, { Document, Schema, Types } from "mongoose";

interface IReviewDocument extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  order: Types.ObjectId;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user:    { type: Schema.Types.ObjectId, ref: "User",    required: true },
    order:   { type: Schema.Types.ObjectId, ref: "Order",   required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: true },
);

// One review per user per product per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

const Review = mongoose.model<IReviewDocument>("Review", reviewSchema);
export default Review;
