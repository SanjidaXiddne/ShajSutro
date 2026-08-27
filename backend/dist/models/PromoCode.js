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
const promoCodeSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: [true, "Promo code is required"],
        unique: true,
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9_-]{3,20}$/, "Code must be 3–20 alphanumeric characters"],
    },
    type: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true,
    },
    value: {
        type: Number,
        required: true,
        min: [0, "Value must be positive"],
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },
    maxUses: {
        type: Number,
        default: null,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    expiresAt: {
        type: Date,
        default: null,
    },
    description: {
        type: String,
        trim: true,
        default: "",
    },
}, { timestamps: true });
const PromoCode = mongoose_1.default.model("PromoCode", promoCodeSchema);
exports.default = PromoCode;
//# sourceMappingURL=PromoCode.js.map