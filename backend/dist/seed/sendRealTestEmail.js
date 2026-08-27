"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const emailService_1 = require("../services/emailService");
async function runRealTest() {
    console.log("📧 Sending real verification email test...");
    console.log(`   Configured EMAIL_USER: ${process.env.EMAIL_USER}`);
    try {
        await (0, emailService_1.sendVerificationEmail)(process.env.EMAIL_USER || "shajsutro@gmail.com", "554433");
        console.log(`✅ Verification Email SENT SUCCESSFULLY from ${process.env.EMAIL_USER}!`);
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Email sending failed:", err.message);
        process.exit(1);
    }
}
runRealTest();
//# sourceMappingURL=sendRealTestEmail.js.map