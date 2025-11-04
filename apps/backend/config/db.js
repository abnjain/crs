import mongoose from "mongoose";
import { config } from "./config.js";

let db = null;
let dbConnectionStatus = "disconnected";

const connectDB = async () => {
  try {
    const uri = config.db.uri;
    const conn = await mongoose.connect(uri);

    console.log("✅ MongoDB Connected:", uri);
    db = mongoose.connection;
    dbConnectionStatus = "connected";

    // Optional: handle runtime disconnects
    db.on("disconnected", () => {
      dbConnectionStatus = "disconnected";
      console.log("⚠️ MongoDB Disconnected");
    });

    db.on("error", (err) => {
      dbConnectionStatus = "error";
      console.error("❌ MongoDB Error:", err);
    });

    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    dbConnectionStatus = "error";
    process.exit(1);
  }
};

export { connectDB, db, dbConnectionStatus };
