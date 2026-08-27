import mongoose from "mongoose";
import dns from "dns";

// Fallback DNS for MongoDB Atlas SRV resolution
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore
}

const OLD_URI = "mongodb+srv://shajsutro:shajsutro@cluster0.k2w7nnp.mongodb.net/?appName=Cluster0";
const NEW_URI = "mongodb+srv://kaggle508_db_user:ivPIM0bsHjGnhP6N@shajsutrocluster.usled3u.mongodb.net/?appName=ShajSutroCluster";
const DB_NAME = "shajsutro";

async function migrate() {
  console.log("🚀 Starting database migration from OLD Cluster to NEW Cluster...\n");

  // 1. Connect to OLD MongoDB Connection
  console.log("📡 Connecting to OLD Database...");
  const oldConn = await mongoose.createConnection(OLD_URI, { dbName: DB_NAME }).asPromise();
  console.log("✓ Connected to OLD Database successfully.\n");

  // 2. Connect to NEW MongoDB Connection
  console.log("📡 Connecting to NEW Database...");
  const newConn = await mongoose.createConnection(NEW_URI, { dbName: DB_NAME }).asPromise();
  console.log("✓ Connected to NEW Database successfully.\n");

  // 3. Get all collection names from OLD database
  const oldDb = oldConn.db;
  const newDb = newConn.db;

  if (!oldDb || !newDb) {
    throw new Error("Failed to get database instances.");
  }

  const collections = await oldDb.listCollections().toArray();
  console.log(`Found ${collections.length} collections in OLD Database to migrate:\n`);

  let totalDocsMigrated = 0;

  for (const collInfo of collections) {
    const name = collInfo.name;
    if (name.startsWith("system.")) continue; // Skip system collections

    const oldCollection = oldDb.collection(name);
    const newCollection = newDb.collection(name);

    const docs = await oldCollection.find({}).toArray();
    console.log(`📦 Collection [${name}]: Found ${docs.length} documents in OLD DB`);

    if (docs.length > 0) {
      // Clear target collection first to avoid duplicate key conflicts, then insert all docs preserving _id
      await newCollection.deleteMany({});
      await newCollection.insertMany(docs);
      console.log(`  └─ Successfully migrated ${docs.length} documents to NEW DB ✓`);
      totalDocsMigrated += docs.length;
    } else {
      console.log(`  └─ (Empty collection, skipped)`);
    }
  }

  console.log(`\n🎉 MIGRATION COMPLETED SUCCESSFULLY!`);
  console.log(`Total documents transferred: ${totalDocsMigrated}`);

  await oldConn.close();
  await newConn.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed with error:", err);
  process.exit(1);
});
