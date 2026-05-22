import connectDB from "@/lib/mongodb";
import { OTP } from "@/lib/models/AdminSession";
import { generateOTP, hashOTP, verifyCredToken, CRED_COOKIE_NAME } from "@/lib/adminAuth";
import { getAdminCredentials } from "@/lib/adminCredentials";
import { sendOTPEmail } from "@/lib/mailer";
import { getCookie, readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    await connectDB();

    const credToken = getCookie(req, CRED_COOKIE_NAME);
    const credDecoded = verifyCredToken(credToken);

    if (!credDecoded) {
      return sendJson(res, 401, {
        success: false,
        error: "Verify email and password first",
      });
    }

    const body = await readJsonBody(req);
    const { email } = body;
    const { email: adminEmail } = await getAdminCredentials();

    if (
      !email ||
      email.toLowerCase() !== credDecoded.email ||
      email.toLowerCase() !== adminEmail?.toLowerCase()
    ) {
      return sendJson(res, 401, { success: false, error: "Unauthorized email address" });
    }

    const recentOTP = await OTP.findOne({
      email: email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });

    if (recentOTP) {
      return sendJson(res, 429, {
        success: false,
        error: "Please wait 60 seconds before requesting another OTP",
      });
    }

    await OTP.deleteMany({ email: email.toLowerCase() });

    const otpCode = generateOTP();
    const hashedOTP = hashOTP(otpCode);

    await OTP.create({
      email: email.toLowerCase(),
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(otpCode, adminEmail);

    return sendJson(res, 200, {
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return sendJson(res, 500, { success: false, error: "Failed to send OTP" });
  }
}
