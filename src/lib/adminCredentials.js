import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { AdminSettings } from "@/lib/models/AdminSession";

const EMAIL_KEY = "adminEmail";
const HASH_KEY = "adminPasswordHash";

async function readCredentialsFromDb() {
  const emailDoc = await AdminSettings.findOne({ key: EMAIL_KEY });
  const hashDoc = await AdminSettings.findOne({ key: HASH_KEY });

  return {
    email: emailDoc?.value?.trim().toLowerCase() || null,
    passwordHash: hashDoc?.value || null,
  };
}

/** One-time bootstrap from env when DB has no credentials yet. */
async function bootstrapCredentialsIfMissing() {
  const existing = await readCredentialsFromDb();
  if (existing.email && existing.passwordHash) return existing;

  const bootstrapEmail = (
    process.env.ADMIN_EMAIL ||
    process.env.GMAIL_USER ||
    process.env.CONTACT_TO_EMAIL
  )
    ?.trim()
    .toLowerCase();
  const bootstrapPassword = process.env.ADMIN_PASSWORD;

  if (!bootstrapEmail || !bootstrapPassword) {
    return existing;
  }

  const hash = bcrypt.hashSync(bootstrapPassword, 12);
  await AdminSettings.findOneAndUpdate(
    { key: EMAIL_KEY },
    { key: EMAIL_KEY, value: bootstrapEmail },
    { upsert: true, new: true }
  );
  await AdminSettings.findOneAndUpdate(
    { key: HASH_KEY },
    { key: HASH_KEY, value: hash },
    { upsert: true, new: true }
  );

  return { email: bootstrapEmail, passwordHash: hash };
}

export async function getAdminCredentials() {
  await connectDB();
  const fromDb = await readCredentialsFromDb();
  if (fromDb.email && fromDb.passwordHash) return fromDb;
  return bootstrapCredentialsIfMissing();
}

export async function verifyAdminPassword(email, password) {
  const { email: adminEmail, passwordHash } = await getAdminCredentials();

  if (!adminEmail || !passwordHash) {
    return {
      ok: false,
      error: "Admin credentials are not configured. Set admin email and password in the database.",
    };
  }

  if (!email?.trim() || email.trim().toLowerCase() !== adminEmail) {
    return { ok: false, error: "Invalid email or password" };
  }

  if (!password || !bcrypt.compareSync(password, passwordHash)) {
    return { ok: false, error: "Invalid email or password" };
  }

  return { ok: true, email: adminEmail };
}

export async function updateAdminEmail(email) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: "Valid email is required" };
  }

  await connectDB();
  await AdminSettings.findOneAndUpdate(
    { key: EMAIL_KEY },
    { key: EMAIL_KEY, value: normalized },
    { upsert: true, new: true }
  );

  return { ok: true, email: normalized };
}

export async function updateAdminPassword(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  await connectDB();
  const hash = bcrypt.hashSync(newPassword, 12);
  await AdminSettings.findOneAndUpdate(
    { key: HASH_KEY },
    { key: HASH_KEY, value: hash },
    { upsert: true, new: true }
  );

  return { ok: true };
}
