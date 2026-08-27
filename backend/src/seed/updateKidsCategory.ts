import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import Category from "../models/Category";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const kidsImg = "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800";
  const res = await Category.updateMany(
    { $or: [{ slug: "kids" }, { name: /kids/i }, { image: /1542291026/ }] },
    { $set: { image: kidsImg } }
  );
  console.log("Updated categories:", res);
  await mongoose.disconnect();
}

run();
