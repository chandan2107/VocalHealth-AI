import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000, 
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log("Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("MongoDB Connected Successfully");
      return mongoose;
    }).catch(e => {
      console.error("MongoDB Connection Failed:", e.message);
      cached.promise = null; // Reset promise so we can retry
      throw e;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default connectToDatabase;
