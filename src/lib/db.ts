// lib/db.ts
import mongoose from "mongoose";
let conn: typeof mongoose | null = null;

export async function db() {
  if (conn) return conn;
  conn = await mongoose.connect(process.env.MONGODB_URI!);
  console.log("database connected");
  return conn;
}
