import mongoose from "mongoose";
import { IOrderDocument } from "../types";
declare const Order: mongoose.Model<IOrderDocument, {}, {}, {}, mongoose.Document<unknown, {}, IOrderDocument, {}, {}> & IOrderDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Order;
//# sourceMappingURL=Order.d.ts.map