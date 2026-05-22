import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin (login page)
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL("/admin", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
