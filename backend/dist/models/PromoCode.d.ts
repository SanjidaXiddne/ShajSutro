import mongoose from "mongoose";
import { IPromoCodeDocument } from "../types";
declare const PromoCode: mongoose.Model<IPromoCodeDocument, {}, {}, {}, mongoose.Document<unknown, {}, IPromoCodeDocument, {}, {}> & IPromoCodeDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default PromoCode;
//# sourceMappingURL=PromoCode.d.ts.map