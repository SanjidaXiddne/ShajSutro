import dotenv from "dotenv";
dotenv.config();

import { sendVerificationEmail } from "../services/emailService";

async function runRealTest() {
  console.log("📧 Sending real verification email test...");
  console.log(`   Configured EMAIL_USER: ${process.env.EMAIL_USER}`);

  try {
    await sendVerificationEmail(process.env.EMAIL_USER || "shajsutro@gmail.com", "554433");
    console.log(`✅ Verification Email SENT SUCCESSFULLY from ${process.env.EMAIL_USER}!`);
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Email sending failed:", err.message);
    process.exit(1);
  }
}

runRealTest();
