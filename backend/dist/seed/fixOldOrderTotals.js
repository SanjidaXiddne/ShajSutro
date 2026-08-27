"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
try {
    dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
}
catch { }
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
const Order_1 = __importDefault(require("../models/Order"));
async function fixOldOrderTotals() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("MONGODB_URI missing");
            process.exit(1);
        }
        await mongoose_1.default.connect(uri, { dbName: "shajsutro" });
        console.log("Connected to Primary MongoDB...");
        const orders = await Order_1.default.find({});
        console.log(`Found ${orders.length} total orders to check...`);
        let updatedCount = 0;
        for (const order of orders) {
            const itemsSubtotal = parseFloat(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
            const subtotal = order.subtotal || itemsSubtotal;
            const shippingCost = order.shippingCost ?? 0;
            const discount = order.discount ?? 0;
            const correctTotal = parseFloat(Math.max(0, subtotal + shippingCost - discount).toFixed(2));
            const targetPaymentStatus = order.paymentMethod !== "cod" ? "paid" : (order.paymentStatus || "pending_delivery");
            if (order.tax !== 0 ||
                order.total !== correctTotal ||
                order.subtotal !== subtotal ||
                order.paymentStatus !== targetPaymentStatus) {
                order.tax = 0;
                order.subtotal = subtotal;
                order.total = correctTotal;
                order.paymentStatus = targetPaymentStatus;
                await order.save();
                updatedCount++;
                console.log(`Updated Order #${order._id.toString().slice(-8).toUpperCase()}: Subtotal=৳${subtotal}, PaymentStatus=${targetPaymentStatus}, Total=৳${correctTotal}`);
            }
        }
        console.log(`✓ Successfully updated ${updatedCount} orders!`);
        const secUri = process.env.MONGODB_SECONDARY_URI;
        if (secUri) {
            const secConn = mongoose_1.default.createConnection(secUri, { dbName: "shajsutro" });
            await secConn.asPromise();
            console.log("Connected to Secondary MongoDB...");
            const SecOrder = secConn.model("Order", Order_1.default.schema);
            const secOrders = await SecOrder.find({});
            for (const order of secOrders) {
                const itemsSubtotal = parseFloat(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
                const subtotal = order.subtotal || itemsSubtotal;
                const shippingCost = order.shippingCost ?? 0;
                const discount = order.discount ?? 0;
                const correctTotal = parseFloat(Math.max(0, subtotal + shippingCost - discount).toFixed(2));
                const targetPaymentStatus = order.paymentMethod !== "cod" ? "paid" : (order.paymentStatus || "pending_delivery");
                order.tax = 0;
                order.subtotal = subtotal;
                order.total = correctTotal;
                order.paymentStatus = targetPaymentStatus;
                await order.save();
            }
            console.log("✓ Secondary DB orders updated!");
        }
        process.exit(0);
    }
    catch (err) {
        console.error("Error updating order totals:", err);
        process.exit(1);
    }
}
fixOldOrderTotals();
//# sourceMappingURL=fixOldOrderTotals.js.map