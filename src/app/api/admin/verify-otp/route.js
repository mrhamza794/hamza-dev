import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { OTP } from "@/lib/models/AdminSession";
import { verifyOTP, generateToken, getAdminEmail, COOKIE_NAME } from "@/lib/adminAuth";
import { getIpFromRequest, parseUserAgent } from "@/lib/helpers";
import { sendLoginNotification } from "@/lib/mailer";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    if (email.toLowerCase() !== getAdminEmail().toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      verified: false,
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "OTP not found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Verify OTP
    const isValid = verifyOTP(otp, otpRecord.otp);

    if (!isValid) {
      await OTP.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      const remaining = 4 - otpRecord.attempts;
      return NextResponse.json(
        { success: false, error: `Invalid OTP. ${remaining} attempts remaining.` },
        { status: 400 }
      );
    }

    // Mark OTP as verified and delete
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT
    const token = generateToken({
      email: email.toLowerCase(),
      role: "admin",
    });

    // Send login notification email
    const ip = getIpFromRequest(request);
    const ua = request.headers.get("user-agent") || "";
    const deviceInfo = parseUserAgent(ua);
    sendLoginNotification(ip, `${deviceInfo.browser.name} on ${deviceInfo.os.name}`).catch(() => {});

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
