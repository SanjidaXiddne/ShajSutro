import mongoose from "mongoose";
import { IProductDocument } from "../types";
declare const Product: mongoose.Model<IProductDocument, {}, {}, {}, mongoose.Document<unknown, {}, IProductDocument, {}, {}> & IProductDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Product;
//# sourceMappingURL=Product.d.ts.map