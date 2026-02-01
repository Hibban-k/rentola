import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.DB_NAME || "rentola"; // Default database name

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');

}
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
};
export async function connectToDatabase() {
    if (cached.conn) {
        console.log("✅ Using cached MongoDB connection");
        return cached.conn;
    }
    if (!cached.promise) {
        console.log("🔄 Connecting to MongoDB...");

        const opt = {
            dbName: DB_NAME,
        }
        cached.promise = mongoose
            .connect(MONGODB_URI, opt)
            .then(() => {
                console.log("✅ MongoDB connected successfully to database:", DB_NAME);
                return mongoose.connection;
            });
    }
    try {
        cached.conn = await cached.promise;
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        cached.promise = null;
        throw error;
    }
    return cached.conn;
}