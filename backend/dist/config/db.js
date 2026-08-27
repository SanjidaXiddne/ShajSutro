"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secondaryConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
// Fallback DNS for MongoDB Atlas SRV resolution (only in local environments)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
        dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
    }
    catch (error) {
        console.warn("⚠️ Warning: Failed to set custom DNS servers:", error);
    }
}
exports.secondaryConnection = null;
/**
 * Register global plugin on Mongoose schemas to automatically sync all write
 * operations (save, insertMany, update, delete) to the secondary backup MongoDB cluster in real-time.
 */
mongoose_1.default.plugin((schema) => {
    // 1. Real-time Sync on Document Save (.save())
    schema.post("save", function (doc) {
        if (!exports.secondaryConnection || !exports.secondaryConnection.db)
            return;
        const collectionName = this?.collection?.name ||
            doc?.collection?.name ||
            doc?.constructor?.modelName;
        if (!collectionName)
            return;
        exports.secondaryConnection.db
            .collection(collectionName)
            .replaceOne({ _id: doc._id }, doc.toObject(), { upsert: true })
            .catch((err) => console.error(`⚠️ Dual-DB Sync Warning [${collectionName}.save]:`, err.message));
    });
    // 2. Real-time Sync on insertMany
    schema.post("insertMany", function (docs) {
        if (!exports.secondaryConnection || !exports.secondaryConnection.db)
            return;
        const collectionName = this?.collection?.name ||
            this?.modelName;
        if (!collectionName)
            return;
        const rawDocs = Array.isArray(docs)
            ? docs.map((d) => (d.toObject ? d.toObject() : d))
            : [];
        if (rawDocs.length === 0)
            return;
        const ops = rawDocs.map((doc) => ({
            replaceOne: {
                filter: { _id: doc._id },
                replacement: doc,
                upsert: true,
            },
        }));
        exports.secondaryConnection.db
            .collection(collectionName)
            .bulkWrite(ops)
            .catch((err) => console.error(`⚠️ Dual-DB Sync Warning [${collectionName}.insertMany]:`, err.message));
    });
    // 3. Real-time Sync on Query Updates (findOneAndUpdate, updateOne, updateMany)
    schema.post(["findOneAndUpdate", "updateOne", "updateMany"], async function () {
        if (!exports.secondaryConnection || !exports.secondaryConnection.db)
            return;
        const collectionName = this.model?.collection?.name;
        const filter = this.getFilter();
        if (!collectionName || !filter)
            return;
        try {
            const updatedDocs = await this.model.find(filter).lean();
            if (updatedDocs && updatedDocs.length > 0) {
                const ops = updatedDocs.map((doc) => ({
                    replaceOne: {
                        filter: { _id: doc._id },
                        replacement: doc,
                        upsert: true,
                    },
                }));
                await exports.secondaryConnection.db.collection(collectionName).bulkWrite(ops);
            }
        }
        catch (err) {
            console.error(`⚠️ Dual-DB Sync Warning [${collectionName}.update]:`, err.message);
        }
    });
    // 4. Real-time Sync on Query Deletes (findOneAndDelete, deleteOne, deleteMany)
    schema.post(["findOneAndDelete", "deleteOne", "deleteMany"], async function () {
        if (!exports.secondaryConnection || !exports.secondaryConnection.db)
            return;
        const collectionName = this.model?.collection?.name;
        const filter = this.getFilter();
        if (!collectionName || !filter)
            return;
        try {
            await exports.secondaryConnection.db.collection(collectionName).deleteMany(filter);
        }
        catch (err) {
            console.error(`⚠️ Dual-DB Sync Warning [${collectionName}.delete]:`, err.message);
        }
    });
});
const connectDB = async () => {
    if (mongoose_1.default.connection.readyState >= 1) {
        return;
    }
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("✗ MONGODB_URI is not defined in environment variables");
            return;
        }
        // 1. Connect to Primary Database
        const conn = await mongoose_1.default.connect(uri, {
            dbName: "shajsutro",
        });
        console.log(`✓ Primary MongoDB connected: ${conn.connection.host}`);
        // 2. Connect to Secondary Backup Database
        const secondaryUri = process.env.MONGODB_SECONDARY_URI;
        if (secondaryUri && !exports.secondaryConnection) {
            try {
                exports.secondaryConnection = mongoose_1.default.createConnection(secondaryUri, {
                    dbName: "shajsutro",
                });
                await exports.secondaryConnection.asPromise();
                console.log(`✓ Secondary Backup MongoDB connected: ${exports.secondaryConnection.host}`);
                console.log(`⚡ Real-time Dual-DB Sync Enabled (Primary ↔ Secondary)`);
            }
            catch (secErr) {
                console.error("⚠️ Warning: Failed to connect Secondary MongoDB:", secErr.message);
            }
        }
    }
    catch (error) {
        console.error("✗ Primary MongoDB connection failed:", error?.message || error);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map