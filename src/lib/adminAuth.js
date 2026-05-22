import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "hc_admin_token";
const TOKEN_EXPIRY = "24h";

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

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL;
}

export { COOKIE_NAME };
