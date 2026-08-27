"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Run once to create the admin account:
 *   npx ts-node src/seed/createAdmin.ts
 */
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const dns_1 = __importDefault(require("dns"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
try {
    dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
}
catch {
    // Ignore
}
const ADMIN = {
    name: "ShajSutro Admin",
    email: "admin@shajsutro.com",
    password: "Admin@1234",
    role: "admin",
    isEmailVerified: true,
};
async function main() {
    await mongoose_1.default.connect(process.env.MONGODB_URI, { dbName: "shajsutro" });
    console.log("Connected to MongoDB");
    // Upsert — delete and recreate so password is always fresh
    await User_1.default.deleteOne({ email: ADMIN.email });
    await User_1.default.create(ADMIN);
    console.log("✓ Admin created successfully");
    console.log(`  Email   : ${ADMIN.email}`);
    console.log(`  Password: ${ADMIN.password}`);
    process.exit(0);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=createAdmin.js.map