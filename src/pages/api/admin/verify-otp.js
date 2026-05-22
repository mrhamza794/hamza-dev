import connectDB from "@/lib/mongodb";
import { OTP } from "@/lib/models/AdminSession";
import {
  verifyOTP,
  generateToken,
  verifyCredToken,
  CRED_COOKIE_NAME,
  buildAuthCookie,
  buildClearCookie,
} from "@/lib/adminAuth";
import { getAdminCredentials } from "@/lib/adminCredentials";
import { getIpFromRequest, parseUserAgent } from "@/lib/helpers";
import { sendLoginNotification } from "@/lib/mailer";
import {
  getCookie,
  getUserAgent,
  readJsonBody,
  sendJson,
  methodNotAllowed,
  setResponseCookies,
} from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    await connectDB();
    const body = await readJsonBody(req);
    const { email, otp } = body;

    if (!email || !otp) {
      return sendJson(res, 400, { success: false, error: "Email and OTP are required" });
    }

    const credToken = getCookie(req, CRED_COOKIE_NAME);
    const credDecoded = verifyCredToken(credToken);
    const { email: adminEmail } = await getAdminCredentials();

    if (
      !credDecoded ||
      email.toLowerCase() !== credDecoded.email ||
      email.toLowerCase() !== adminEmail?.toLowerCase()
    ) {
      return sendJson(res, 401, {
        success: false,
        error: "Unauthorized. Verify credentials first.",
      });
    }

    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      verified: false,
    });

    if (!otpRecord) {
      return sendJson(res, 400, {
        success: false,
        error: "OTP not found. Please request a new one.",
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return sendJson(res, 400, {
        success: false,
        error: "OTP has expired. Please request a new one.",
      });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return sendJson(res, 429, {
        success: false,
        error: "Too many attempts. Please request a new OTP.",
      });
    }

    if (!verifyOTP(otp, otpRecord.otp)) {
      await OTP.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      const remaining = 4 - otpRecord.attempts;
      return sendJson(res, 400, {
        success: false,
        error: `Invalid OTP. ${remaining} attempts remaining.`,
      });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const token = generateToken({
      email: email.toLowerCase(),
      role: "admin",
    });

    const ip = getIpFromRequest(req);
    const ua = getUserAgent(req);
    const deviceInfo = parseUserAgent(ua);
    sendLoginNotification(
      ip,
      `${deviceInfo.browser.name} on ${deviceInfo.os.name}`,
      adminEmail
    ).catch(() => {});

    setResponseCookies(res, [
      buildAuthCookie(token, req),
      buildClearCookie(CRED_COOKIE_NAME, req),
    ]);

    return sendJson(res, 200, {
      success: true,
      message: "Login successful",
      redirect: "/admin/dashboard",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}
