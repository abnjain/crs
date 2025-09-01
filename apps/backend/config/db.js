import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/crs";
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
