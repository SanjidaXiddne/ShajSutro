import mongoose from "mongoose";
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
declare const JobApplication: mongoose.Model<IJobApplicationDocument, {}, {}, {}, mongoose.Document<unknown, {}, IJobApplicationDocument, {}, {}> & IJobApplicationDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default JobApplication;
//# sourceMappingURL=JobApplication.d.ts.map