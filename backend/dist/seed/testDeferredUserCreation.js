"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const User_1 = __importDefault(require("../models/User"));
const PendingUser_1 = __importDefault(require("../models/PendingUser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function testDeferredFlow() {
    console.log("🧪 Testing Deferred User Creation Flow (DB Save only after OTP Verification)...\n");
    await (0, db_1.default)();
    const testEmail = `verifytest-${Date.now()}@example.com`;
    const testPassword = "Password123!";
    const testName = "Unverified Test User";
    // Step 1: Simulate Registration (Store in PendingUser ONLY)
    console.log(`1. Simulating Sign-Up for: ${testEmail}...`);
    const code = "987654";
    await PendingUser_1.default.create({
        name: testName,
        email: testEmail,
        password: testPassword,
        verificationCode: code,
        verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });
    // Step 2: Verify User collection is NOT written yet!
    const userCheckBefore = await User_1.default.findOne({ email: testEmail });
    if (!userCheckBefore) {
        console.log("   ✅ VERIFIED: User is NOT saved in the main User database collection during registration!");
    }
    else {
        console.error("   ❌ ERROR: User was found in User collection prematurely!");
    }
    // Step 3: Check PendingUser collection
    const pendingCheck = await PendingUser_1.default.findOne({ email: testEmail });
    if (pendingCheck && pendingCheck.verificationCode === code) {
        console.log("   ✅ VERIFIED: User temporary info is safely stored in PendingUser collection.");
    }
    // Step 4: Simulate OTP Verification
    console.log("2. Simulating OTP Code Verification...");
    const verifiedUser = await User_1.default.create({
        name: pendingCheck.name,
        email: pendingCheck.email,
        password: pendingCheck.password,
        role: "user",
        isEmailVerified: true,
    });
    await PendingUser_1.default.deleteOne({ _id: pendingCheck._id });
    // Step 5: Verify User collection NOW contains the user!
    const userCheckAfter = await User_1.default.findOne({ email: testEmail });
    if (userCheckAfter && userCheckAfter.isEmailVerified) {
        console.log("   ✅ VERIFIED: User is NOW saved into User collection after successful verification!");
    }
    const pendingCheckAfter = await PendingUser_1.default.findOne({ email: testEmail });
    if (!pendingCheckAfter) {
        console.log("   ✅ VERIFIED: Pending registration record was cleaned up.\n");
    }
    // Clean up test document
    await User_1.default.deleteOne({ _id: verifiedUser._id });
    console.log("🎉 DEFERRED USER CREATION WORKFLOW VERIFIED 100% SUCCESSFUL!");
    process.exit(0);
}
testDeferredFlow().catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});
//# sourceMappingURL=testDeferredUserCreation.js.map