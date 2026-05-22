import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "hc_admin_token";
const CRED_COOKIE_NAME = "hc_admin_cred_verified";
const TOKEN_EXPIRY = "24h";
const CRED_TOKEN_EXPIRY = "15m";

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOTP(otp) {
  return bcrypt.hashSync(otp, 10);
}

export function verifyOTP(otp, hash) {
  return bcrypt.compareSync(otp, hash);
}

export function generateToken(payload) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  if (!JWT_SECRET || !token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function generateCredToken(email) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ email: email.toLowerCase(), step: "credentials" }, JWT_SECRET, {
    expiresIn: CRED_TOKEN_EXPIRY,
  });
}

export function verifyCredToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded?.step !== "credentials" || !decoded?.email) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function cookieOptions(maxAgeSeconds, req) {
  const proto =
    req?.headers?.["x-forwarded-proto"] ||
    (typeof req?.headers?.get === "function" ? req.headers.get("x-forwarded-proto") : null);
  const isSecure =
    proto === "https" ||
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.NETLIFY === "true";

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function buildAuthCookie(token, req) {
  return serialize(COOKIE_NAME, token, cookieOptions(60 * 60 * 24, req));
}

export function buildCredCookie(token, req) {
  return serialize(CRED_COOKIE_NAME, token, cookieOptions(60 * 15, req));
}

export function buildClearCookie(name, req) {
  return serialize(name, "", {
    ...cookieOptions(0, req),
    maxAge: 0,
    expires: new Date(0),
  });
}

export { COOKIE_NAME, CRED_COOKIE_NAME };
