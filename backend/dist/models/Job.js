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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const jobSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Job title is required"],
        trim: true,
    },
    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true,
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true,
    },
    type: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Internship"],
        required: [true, "Job type is required"],
    },
    level: {
        type: String,
        enum: ["Junior", "Mid", "Senior", "Lead"],
        required: [true, "Level is required"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: "",
    },
    deadline: {
        type: Date,
        default: null,
    },
    bullets: {
        type: [String],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
const Job = mongoose_1.default.model("Job", jobSchema);
exports.default = Job;
//# sourceMappingURL=Job.js.map