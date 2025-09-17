import mongoose from "mongoose";
import { config } from "./config.js";

const connectDB = async () => {
  try {
    const uri = config.db.uri;
    const conn = await mongoose.connect(uri)
      .then(conn => {
        console.log("✅ MongoDB Connected:", conn.connection.host);
      });
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
};

export default connectDB;
