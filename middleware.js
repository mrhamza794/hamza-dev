import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/adminAuth";

async function verifyAdminToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const decoded = await verifyAdminToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
