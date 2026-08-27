"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mailer_1 = __importDefault(require("../config/mailer"));
async function verifyTransporter() {
    console.log("📡 Testing Nodemailer SMTP Connection with new credentials...");
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
    try {
        await mailer_1.default.verify();
        console.log("✅ SMTP Server connection verified successfully! Ready to send emails.");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ SMTP Verification failed:", err.message);
        process.exit(1);
    }
}
verifyTransporter();
//# sourceMappingURL=testEmailTransporter.js.map