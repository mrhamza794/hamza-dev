import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";
import { changeAdminPassword, getAdminCredentials } from "@/lib/adminCredentials";

export async function POST(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "All password fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New passwords do not match" },
        { status: 400 }
      );
    }

    const result = await changeAdminPassword(currentPassword, newPassword);

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const { email } = await getAdminCredentials();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      email,
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
