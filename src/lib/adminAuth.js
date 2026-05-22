import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function generateCredToken(email) {
  return jwt.sign({ email: email.toLowerCase(), step: "credentials" }, JWT_SECRET, {
    expiresIn: CRED_TOKEN_EXPIRY,
  });
}

export function verifyCredToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded?.step !== "credentials" || !decoded?.email) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function cookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export { COOKIE_NAME, CRED_COOKIE_NAME };
