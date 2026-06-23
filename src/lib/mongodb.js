import dns from "node:dns";
import dnsPromises from "node:dns/promises";
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

if (MONGO_URI?.startsWith("mongodb+srv://")) {
  configureMongoDns();
}

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, uri: null };
}

function isSrvDnsError(error) {
  const msg = String(error?.message || error || "").toLowerCase();
  return msg.includes("querysrv") || msg.includes("srv") || error?.code === "ECONNREFUSED";
}

function getSrvHostname(srvUri) {
  return srvUri.replace(/^mongodb\+srv:\/\//, "").split("/")[0].split("?")[0];
}

function parseSrvAnswerData(data) {
  const parts = String(data).trim().split(/\s+/);
  if (parts.length < 4) return null;
  const port = Number(parts[2]);
  const name = parts[3].replace(/\.$/, "");
  if (!port || !name) return null;
  return {
    name,
    port,
    priority: Number(parts[0]) || 0,
    weight: Number(parts[1]) || 0,
  };
}

async function resolveSrvViaDoH(fqdn) {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(fqdn)}&type=SRV`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  return (data.Answer || [])
    .filter((answer) => answer.type === 33 && answer.data)
    .map((answer) => parseSrvAnswerData(answer.data))
    .filter(Boolean);
}

async function resolveSrvRecords(hostname) {
  configureMongoDns();
  const fqdn = hostname.startsWith("_mongodb._tcp.")
    ? hostname
    : `_mongodb._tcp.${hostname}`;

  try {
    return await dnsPromises.resolveSrv(fqdn);
  } catch (nativeError) {
    console.warn("[mongodb] Native SRV lookup failed, trying DNS-over-HTTPS:", nativeError.message);
  }

  const viaDoh = await resolveSrvViaDoH(fqdn);
  if (viaDoh.length) return viaDoh;

  throw new Error(`Could not resolve SRV records for ${fqdn}`);
}

/** Convert mongodb+srv://… to mongodb://… using explicit shard hosts. */
async function resolveSrvMongoUri(srvUri) {
  configureMongoDns();

  const direct = process.env.MONGO_URI_DIRECT?.trim();
  if (direct) return direct;

  const withoutScheme = srvUri.replace(/^mongodb\+srv:\/\//, "");
  const at = withoutScheme.lastIndexOf("@");
  if (at === -1) return srvUri;

  const credentials = withoutScheme.slice(0, at);
  const hostAndRest = withoutScheme.slice(at + 1);
  const slash = hostAndRest.indexOf("/");
  const hostPart = slash === -1 ? hostAndRest : hostAndRest.slice(0, slash);
  const pathAndQuery = slash === -1 ? "" : hostAndRest.slice(slash);
  const hostname = hostPart.split("?")[0];

  const records = await resolveSrvRecords(hostname);
  if (!records.length) {
    throw new Error(`No MongoDB SRV records found for ${hostname}`);
  }

  const seeds = records.map((r) => `${r.name}:${r.port}`).join(",");
  let uri = `mongodb://${credentials}@${seeds}${pathAndQuery || "/"}`;

  if (!/[?&](tls|ssl)=/i.test(uri)) {
    uri += uri.includes("?") ? "&tls=true" : "?tls=true";
  }
  if (!/[?&]authSource=/i.test(uri)) {
    uri += "&authSource=admin";
  }

  return uri;
}

async function getConnectionUri() {
  if (cached.uri) return cached.uri;

  const direct = process.env.MONGO_URI_DIRECT?.trim();
  if (direct) {
    cached.uri = direct;
    return direct;
  }

  if (!MONGO_URI.startsWith("mongodb+srv://")) {
    cached.uri = MONGO_URI;
    return MONGO_URI;
  }

  configureMongoDns();

  const hostname = getSrvHostname(MONGO_URI);
  let nativeSrvWorks = false;

  try {
    await dnsPromises.resolveSrv(`_mongodb._tcp.${hostname}`);
    nativeSrvWorks = true;
  } catch {
    nativeSrvWorks = false;
  }

  if (nativeSrvWorks) {
    cached.uri = MONGO_URI;
    return MONGO_URI;
  }

  cached.uri = await resolveSrvMongoUri(MONGO_URI);
  return cached.uri;
}

async function connectWithFallback() {
  configureMongoDns();

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000,
  };

  let uri = await getConnectionUri();

  try {
    return await mongoose.connect(uri, opts);
  } catch (error) {
    if (!isSrvDnsError(error) || !MONGO_URI.startsWith("mongodb+srv://") || uri !== MONGO_URI) {
      throw error;
    }

    uri = await resolveSrvMongoUri(MONGO_URI);
    cached.uri = uri;
    return mongoose.connect(uri, opts);
  }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectWithFallback().then((mongooseInstance) => {
      console.log("MongoDB Connected Successfully");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.uri = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
