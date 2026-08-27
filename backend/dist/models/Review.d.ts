import mongoose, { Document, Types } from "mongoose";
interface IReviewDocument extends Document {
    product: Types.ObjectId;
    user: Types.ObjectId;
    order: Types.ObjectId;
    rating: number;
    comment: string;
}
declare const Review: mongoose.Model<IReviewDocument, {}, {}, {}, mongoose.Document<unknown, {}, IReviewDocument, {}, {}> & IReviewDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Review;
//# sourceMappingURL=Review.d.ts.map