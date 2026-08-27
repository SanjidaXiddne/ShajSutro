import dotenv from "dotenv";
dotenv.config();

import transporter from "../config/mailer";

async function verifyTransporter() {
  console.log("📡 Testing Nodemailer SMTP Connection with new credentials...");
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);

  try {
    await transporter.verify();
    console.log("✅ SMTP Server connection verified successfully! Ready to send emails.");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ SMTP Verification failed:", err.message);
    process.exit(1);
  }
}

verifyTransporter();
