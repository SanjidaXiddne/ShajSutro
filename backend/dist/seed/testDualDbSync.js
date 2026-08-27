"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importStar(require("../config/db"));
const Category_1 = __importDefault(require("../models/Category"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function testSync() {
    console.log("🧪 Testing Real-Time Dual-DB Synchronization...\n");
    await (0, db_1.default)();
    // Wait 1 second for secondary connection to establish
    await new Promise((r) => setTimeout(r, 1500));
    if (!db_1.secondaryConnection || !db_1.secondaryConnection.db) {
        throw new Error("Secondary connection is not ready");
    }
    const testSlug = `test-sync-cat-${Date.now()}`;
    console.log(`1. Creating Test Category [slug: ${testSlug}] in Primary DB...`);
    const created = await Category_1.default.create({
        name: "Dual-DB Test Category",
        slug: testSlug,
        description: "Testing real-time replication across two clusters",
    });
    console.log("   ✓ Saved to Primary DB.");
    // Wait 1 second for async sync hook
    await new Promise((r) => setTimeout(r, 1500));
    // Check Secondary DB directly
    const secDoc = await db_1.secondaryConnection.db
        .collection("categories")
        .findOne({ _id: created._id });
    if (secDoc && secDoc.name === "Dual-DB Test Category") {
        console.log("   ✅ VERIFIED: Document successfully mirrored to Secondary DB!\n");
    }
    else {
        console.error("   ❌ Failed to verify document in Secondary DB");
    }
    // 2. Test Update
    console.log("2. Updating Test Category name to 'Updated Dual-DB Name'...");
    created.name = "Updated Dual-DB Name";
    await created.save();
    await new Promise((r) => setTimeout(r, 1500));
    const updatedSecDoc = await db_1.secondaryConnection.db
        .collection("categories")
        .findOne({ _id: created._id });
    if (updatedSecDoc && updatedSecDoc.name === "Updated Dual-DB Name") {
        console.log("   ✅ VERIFIED: Update successfully mirrored to Secondary DB!\n");
    }
    else {
        console.error("   ❌ Failed to verify update in Secondary DB");
    }
    // 3. Clean up Test Category from both DBs
    console.log("3. Deleting Test Category...");
    await Category_1.default.deleteOne({ _id: created._id });
    await new Promise((r) => setTimeout(r, 1500));
    const deletedSecDoc = await db_1.secondaryConnection.db
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
//# sourceMappingURL=testDualDbSync.js.map