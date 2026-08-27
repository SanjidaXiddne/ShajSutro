import mongoose, { Document } from "mongoose";
export interface ISubscriber {
    email: string;
    isActive: boolean;
    subscribedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ISubscriberDocument extends ISubscriber, Document {
}
declare const Subscriber: mongoose.Model<ISubscriberDocument, {}, {}, {}, mongoose.Document<unknown, {}, ISubscriberDocument, {}, {}> & ISubscriberDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Subscriber;
//# sourceMappingURL=Subscriber.d.ts.map