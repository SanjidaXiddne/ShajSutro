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
  await mongoose.connect(uri, { dbName: "shajsutro" });
  const categories = await Category.find({});
  console.log("Found Categories count:", categories.length);
  for (const c of categories) {
    console.log(`- ID: ${c._id}, Name: "${c.name}", Slug: "${c.slug}", Image: "${c.image}"`);
  }

  const kidsImg = "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800";

  for (const cat of categories) {
    if (
      cat.name.toLowerCase().includes("shoe") ||
      cat.name.toLowerCase().includes("footwear") ||
      cat.slug.toLowerCase().includes("shoe") ||
      cat.image?.includes("1542291026") ||
      cat.slug === "kids" ||
      cat.name.toLowerCase() === "kids"
    ) {
      cat.image = kidsImg;
      if (cat.name.toLowerCase().includes("shoe")) {
        cat.name = "Kids";
        cat.slug = "kids";
      }
      await cat.save();
      console.log(`✅ Updated Category ${cat._id} (${cat.name}) image to kidsImg`);
    }
  }

  await mongoose.disconnect();
}

run();
