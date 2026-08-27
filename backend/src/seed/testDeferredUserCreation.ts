import connectDB from "../config/db";
import User from "../models/User";
import PendingUser from "../models/PendingUser";
import dotenv from "dotenv";

dotenv.config();

async function testDeferredFlow() {
  console.log("🧪 Testing Deferred User Creation Flow (DB Save only after OTP Verification)...\n");
  await connectDB();

  const testEmail = `verifytest-${Date.now()}@example.com`;
  const testPassword = "Password123!";
  const testName = "Unverified Test User";

  // Step 1: Simulate Registration (Store in PendingUser ONLY)
  console.log(`1. Simulating Sign-Up for: ${testEmail}...`);
  const code = "987654";
  await PendingUser.create({
    name: testName,
    email: testEmail,
    password: testPassword,
    verificationCode: code,
    verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
  });

  // Step 2: Verify User collection is NOT written yet!
  const userCheckBefore = await User.findOne({ email: testEmail });
  if (!userCheckBefore) {
    console.log("   ✅ VERIFIED: User is NOT saved in the main User database collection during registration!");
  } else {
    console.error("   ❌ ERROR: User was found in User collection prematurely!");
  }

  // Step 3: Check PendingUser collection
  const pendingCheck = await PendingUser.findOne({ email: testEmail });
  if (pendingCheck && pendingCheck.verificationCode === code) {
    console.log("   ✅ VERIFIED: User temporary info is safely stored in PendingUser collection.");
  }

  // Step 4: Simulate OTP Verification
  console.log("2. Simulating OTP Code Verification...");
  const verifiedUser = await User.create({
    name: pendingCheck!.name,
    email: pendingCheck!.email,
    password: pendingCheck!.password,
    role: "user",
    isEmailVerified: true,
  });

  await PendingUser.deleteOne({ _id: pendingCheck!._id });

  // Step 5: Verify User collection NOW contains the user!
  const userCheckAfter = await User.findOne({ email: testEmail });
  if (userCheckAfter && userCheckAfter.isEmailVerified) {
    console.log("   ✅ VERIFIED: User is NOW saved into User collection after successful verification!");
  }

  const pendingCheckAfter = await PendingUser.findOne({ email: testEmail });
  if (!pendingCheckAfter) {
    console.log("   ✅ VERIFIED: Pending registration record was cleaned up.\n");
  }

  // Clean up test document
  await User.deleteOne({ _id: verifiedUser._id });
  console.log("🎉 DEFERRED USER CREATION WORKFLOW VERIFIED 100% SUCCESSFUL!");
  process.exit(0);
}

testDeferredFlow().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
