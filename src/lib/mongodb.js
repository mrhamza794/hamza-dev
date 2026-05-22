import dns from "node:dns";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

/** Home/office routers often reject SRV DNS; Node then fails with querySrv ECONNREFUSED. */
function configureMongoDns() {
  const custom = process.env.MONGO_DNS_SERVERS?.trim();
  if (custom) {
    dns.setServers(custom.split(/[,\s]+/).filter(Boolean));
    return;
  }
  if (MONGO_URI?.startsWith("mongodb+srv://")) {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  }
}
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    configureMongoDns();

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("MongoDB Connected Successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
