import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";

export async function GET(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    email: decoded.email,
  });
}
