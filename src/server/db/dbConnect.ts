"use server";
import mongoose, { Mongoose } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.MONGODB_URI;

if (!DB_URL) {
  throw new Error(
    "Please define the DB_URL environment variable inside .env*.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  // console.log("dbConnect");
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000, 
    };
    cached.promise = mongoose.connect(DB_URL, opts).then((mongoose) => {
      mongoose.set("debug", process.env.NODE_ENV === "development");

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

export default dbConnect;
