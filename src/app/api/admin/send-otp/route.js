import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { OTP } from "@/lib/models/AdminSession";
import { generateOTP, hashOTP, verifyCredToken, CRED_COOKIE_NAME } from "@/lib/adminAuth";
import { getAdminCredentials } from "@/lib/adminCredentials";
import { sendOTPEmail } from "@/lib/mailer";

export async function POST(request) {
  try {
    await connectDB();

    const credToken = request.cookies.get(CRED_COOKIE_NAME)?.value;
    const credDecoded = verifyCredToken(credToken);

    if (!credDecoded) {
      return NextResponse.json(
        { success: false, error: "Verify email and password first" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email } = body;
    const { email: adminEmail } = await getAdminCredentials();

    if (!email || email.toLowerCase() !== credDecoded.email || email.toLowerCase() !== adminEmail?.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Unauthorized email address" },
        { status: 401 }
      );
    }

    // Rate limit: check if OTP was sent in last 60 seconds
    const recentOTP = await OTP.findOne({
      email: email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });

    if (recentOTP) {
      return NextResponse.json(
        { success: false, error: "Please wait 60 seconds before requesting another OTP" },
        { status: 429 }
      );
    }

    // Delete old OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Generate and hash OTP
    const otpCode = generateOTP();
    const hashedOTP = hashOTP(otpCode);

    // Save OTP to DB (expires in 10 minutes)
    await OTP.create({
      email: email.toLowerCase(),
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(otpCode, adminEmail);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
