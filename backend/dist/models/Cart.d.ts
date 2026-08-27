import mongoose from "mongoose";
import { ICartDocument } from "../types";
declare const Cart: mongoose.Model<ICartDocument, {}, {}, {}, mongoose.Document<unknown, {}, ICartDocument, {}, {}> & ICartDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Cart;
//# sourceMappingURL=Cart.d.ts.map