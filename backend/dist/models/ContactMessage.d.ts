import mongoose, { Document } from "mongoose";
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
declare const ContactMessage: mongoose.Model<IContactMessageDocument, {}, {}, {}, mongoose.Document<unknown, {}, IContactMessageDocument, {}, {}> & IContactMessageDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default ContactMessage;
//# sourceMappingURL=ContactMessage.d.ts.map