/**
 * Run once to create the admin account:
 *   npx ts-node src/seed/createAdmin.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import User from "../models/User";

dotenv.config();

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore
}

const ADMIN = {
  name: "ShajSutro Admin",
  email: "admin@shajsutro.com",
  password: "Admin@1234",
  role: "admin" as const,
  isEmailVerified: true,
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!, { dbName: "shajsutro" });
  console.log("Connected to MongoDB");

  // Upsert — delete and recreate so password is always fresh
  await User.deleteOne({ email: ADMIN.email });
  await User.create(ADMIN);
  console.log("✓ Admin created successfully");
  console.log(`  Email   : ${ADMIN.email}`);
  console.log(`  Password: ${ADMIN.password}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
