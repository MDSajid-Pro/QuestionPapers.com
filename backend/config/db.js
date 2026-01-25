import mongoose from "mongoose";

// 1. Get the URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

// 2. Create a global cache to store the connection between hot reloads/invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // 3. If a connection is already cached, return it immediately (SPEEDS UP REQUESTS)
  if (cached.conn) {
    return cached.conn;
  }

  // 4. If no connection exists, create a new one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Important: Throw error immediately if connection fails, don't hang
    };

    // Note: We append "/question-papers" here as you did in your original code
    cached.promise = mongoose.connect(`${MONGODB_URI}/question-papers`, opts).then((mongoose) => {
      console.log("✅ New Database Connection Established");
      return mongoose;
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

export default connectDB;