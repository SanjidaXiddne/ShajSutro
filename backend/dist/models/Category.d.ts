import mongoose from "mongoose";
import { ICategoryDocument } from "../types";
declare const Category: mongoose.Model<ICategoryDocument, {}, {}, {}, mongoose.Document<unknown, {}, ICategoryDocument, {}, {}> & ICategoryDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Category;
//# sourceMappingURL=Category.d.ts.map