import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db";
import Product from "../models/Product";

dotenv.config();

function generateSku(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (len: number) =>
    Array.from({ length: len }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  return `OY-${part(4)}-${part(4)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function addSkuToExistingProducts() {
  await connectDB();

  const products = await Product.find({});
  console.log(`Found ${products.length} products to check SKU...`);

  let updatedCount = 0;
  for (const product of products) {
    if (!product.sku) {
      product.sku = generateSku();
      await product.save();
      updatedCount++;
      console.log(`Assigned SKU: ${product.sku} -> "${product.name}"`);
    }
  }

  console.log(`Done! Updated ${updatedCount} products with SKUs.`);
  await mongoose.disconnect();
}

addSkuToExistingProducts().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
