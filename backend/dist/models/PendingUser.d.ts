import mongoose, { Document } from "mongoose";
export interface IPendingUserDocument extends Document {
    name: string;
    email: string;
    password: string;
    role?: "user" | "admin" | "sub-admin";
    verificationCode: string;
    verificationCodeExpiry: Date;
    createdAt: Date;
}
declare const PendingUser: mongoose.Model<IPendingUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IPendingUserDocument, {}, {}> & IPendingUserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default PendingUser;
//# sourceMappingURL=PendingUser.d.ts.map