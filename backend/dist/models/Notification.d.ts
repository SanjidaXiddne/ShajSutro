import mongoose from "mongoose";
import { INotificationDocument } from "../types";
declare const Notification: mongoose.Model<INotificationDocument, {}, {}, {}, mongoose.Document<unknown, {}, INotificationDocument, {}, {}> & INotificationDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Notification;
//# sourceMappingURL=Notification.d.ts.map