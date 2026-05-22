import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/adminCredentials";
import { generateCredToken, CRED_COOKIE_NAME, cookieOptions } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await verifyAdminPassword(email, password);

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    const credToken = generateCredToken(result.email);

    const response = NextResponse.json({
      success: true,
      message: "Credentials verified. Proceed to OTP.",
      email: result.email,
    });

    response.cookies.set(CRED_COOKIE_NAME, credToken, cookieOptions(60 * 15));

    return response;
  } catch (error) {
    console.error("Verify credentials error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
