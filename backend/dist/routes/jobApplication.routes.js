"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const jobApplication_controller_1 = require("../controllers/jobApplication.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const getUploadDir = () => {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const baseDir = isServerless ? os_1.default.tmpdir() : process.cwd();
    const uploadDir = path_1.default.join(baseDir, "uploads", "cv");
    try {
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        return uploadDir;
    }
    catch (err) {
        console.warn("Could not create upload directory, falling back to temp dir:", err);
        const tmpDir = path_1.default.join(os_1.default.tmpdir(), "uploads", "cv");
        try {
            if (!fs_1.default.existsSync(tmpDir)) {
                fs_1.default.mkdirSync(tmpDir, { recursive: true });
            }
        }
        catch {
            // Ignore failure in read-only environment
        }
        return tmpDir;
    }
};
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, getUploadDir());
    },
    filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
        cb(null, `${Date.now()}_${safe}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
    fileFilter: (_req, file, cb) => {
        const allowed = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only PDF/DOC/DOCX files are allowed"));
        }
        cb(null, true);
    },
});
router.post("/", upload.single("cv"), jobApplication_controller_1.createJobApplication);
router.get("/all", auth_middleware_1.protect, auth_middleware_1.adminOnly, jobApplication_controller_1.getAllJobApplications);
exports.default = router;
//# sourceMappingURL=jobApplication.routes.js.map