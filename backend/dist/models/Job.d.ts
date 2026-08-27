import mongoose from "mongoose";
import { IJobDocument } from "../types";
declare const Job: mongoose.Model<IJobDocument, {}, {}, {}, mongoose.Document<unknown, {}, IJobDocument, {}, {}> & IJobDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Job;
//# sourceMappingURL=Job.d.ts.map