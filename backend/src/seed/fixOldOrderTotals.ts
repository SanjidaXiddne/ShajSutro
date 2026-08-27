import dns from "dns";
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch {}

import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config({ path: path.join(__dirname, "../../.env") });

import Order from "../models/Order";

async function fixOldOrderTotals() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI missing");
      process.exit(1);
    }
    await mongoose.connect(uri, { dbName: "shajsutro" });
    console.log("Connected to Primary MongoDB...");

    const orders = await Order.find({});
    console.log(`Found ${orders.length} total orders to check...`);

    let updatedCount = 0;
    for (const order of orders) {
      const itemsSubtotal = parseFloat(
        order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
      );
      const subtotal = order.subtotal || itemsSubtotal;
      const shippingCost = order.shippingCost ?? 0;
      const discount = order.discount ?? 0;
      const correctTotal = parseFloat(Math.max(0, subtotal + shippingCost - discount).toFixed(2));
      const targetPaymentStatus = order.paymentMethod !== "cod" ? "paid" : (order.paymentStatus || "pending_delivery");

      if (
        order.tax !== 0 ||
        order.total !== correctTotal ||
        order.subtotal !== subtotal ||
        order.paymentStatus !== targetPaymentStatus
      ) {
        order.tax = 0;
        order.subtotal = subtotal;
        order.total = correctTotal;
        order.paymentStatus = targetPaymentStatus as any;
        await order.save();
        updatedCount++;
        console.log(`Updated Order #${order._id.toString().slice(-8).toUpperCase()}: Subtotal=৳${subtotal}, PaymentStatus=${targetPaymentStatus}, Total=৳${correctTotal}`);
      }
    }

    console.log(`✓ Successfully updated ${updatedCount} orders!`);

    const secUri = process.env.MONGODB_SECONDARY_URI;
    if (secUri) {
      const secConn = mongoose.createConnection(secUri, { dbName: "shajsutro" });
      await secConn.asPromise();
      console.log("Connected to Secondary MongoDB...");
      const SecOrder = secConn.model("Order", Order.schema);
      const secOrders = await SecOrder.find({});
      for (const order of secOrders) {
        const itemsSubtotal = parseFloat(
          order.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0).toFixed(2)
        );
        const subtotal = order.subtotal || itemsSubtotal;
        const shippingCost = order.shippingCost ?? 0;
        const discount = order.discount ?? 0;
        const correctTotal = parseFloat(Math.max(0, subtotal + shippingCost - discount).toFixed(2));
        const targetPaymentStatus = order.paymentMethod !== "cod" ? "paid" : (order.paymentStatus || "pending_delivery");
        order.tax = 0;
        order.subtotal = subtotal;
        order.total = correctTotal;
        order.paymentStatus = targetPaymentStatus as any;
        await order.save();
      }
      console.log("✓ Secondary DB orders updated!");
    }

    process.exit(0);
  } catch (err: any) {
    console.error("Error updating order totals:", err);
    process.exit(1);
  }
}

fixOldOrderTotals();
