import { NextResponse } from "next/server";
import { COOKIE_NAME, CRED_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  response.cookies.delete(CRED_COOKIE_NAME);
  return response;
}
