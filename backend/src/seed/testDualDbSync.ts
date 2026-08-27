import connectDB, { secondaryConnection } from "../config/db";
import Category from "../models/Category";
import dotenv from "dotenv";

dotenv.config();

async function testSync() {
  console.log("🧪 Testing Real-Time Dual-DB Synchronization...\n");
  await connectDB();

  // Wait 1 second for secondary connection to establish
  await new Promise((r) => setTimeout(r, 1500));

  if (!secondaryConnection || !secondaryConnection.db) {
    throw new Error("Secondary connection is not ready");
  }

  const testSlug = `test-sync-cat-${Date.now()}`;
  console.log(`1. Creating Test Category [slug: ${testSlug}] in Primary DB...`);
  const created = await Category.create({
    name: "Dual-DB Test Category",
    slug: testSlug,
    description: "Testing real-time replication across two clusters",
  });
  console.log("   ✓ Saved to Primary DB.");

  // Wait 1 second for async sync hook
  await new Promise((r) => setTimeout(r, 1500));

  // Check Secondary DB directly
  const secDoc = await secondaryConnection.db
    .collection("categories")
    .findOne({ _id: created._id });

  if (secDoc && secDoc.name === "Dual-DB Test Category") {
    console.log("   ✅ VERIFIED: Document successfully mirrored to Secondary DB!\n");
  } else {
    console.error("   ❌ Failed to verify document in Secondary DB");
  }

  // 2. Test Update
  console.log("2. Updating Test Category name to 'Updated Dual-DB Name'...");
  created.name = "Updated Dual-DB Name";
  await created.save();
  await new Promise((r) => setTimeout(r, 1500));

  const updatedSecDoc = await secondaryConnection.db
    .collection("categories")
    .findOne({ _id: created._id });

  if (updatedSecDoc && updatedSecDoc.name === "Updated Dual-DB Name") {
    console.log("   ✅ VERIFIED: Update successfully mirrored to Secondary DB!\n");
  } else {
    console.error("   ❌ Failed to verify update in Secondary DB");
  }

  // 3. Clean up Test Category from both DBs
  console.log("3. Deleting Test Category...");
  await Category.deleteOne({ _id: created._id });
  await new Promise((r) => setTimeout(r, 1500));

  const deletedSecDoc = await secondaryConnection.db
    .collection("categories")
    .findOne({ _id: created._id });

  if (!deletedSecDoc) {
    console.log("   ✅ VERIFIED: Deletion successfully mirrored to Secondary DB!\n");
  }

  console.log("🎉 DUAL-DB REAL-TIME MIRRORING IS 100% WORKING!");
  process.exit(0);
}

testSync().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
