import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const LEGACY_COOKIE = "hc_admin_token";

function getAdminGoogleEmail() {
  return (
    process.env.ADMIN_GOOGLE_EMAIL ||
    process.env.GMAIL_USER ||
    process.env.CONTACT_TO_EMAIL ||
    ""
  )
    .trim()
    .toLowerCase();
}

async function verifyLegacyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return payload?.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const allowedGoogle = getAdminGoogleEmail();

    const nextAuthToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    });
    const googleEmail = nextAuthToken?.email?.toLowerCase();

    if (allowedGoogle && googleEmail === allowedGoogle) {
      return NextResponse.next();
    }

    const legacyToken = request.cookies.get(LEGACY_COOKIE)?.value;
    const legacy = await verifyLegacyToken(legacyToken);
    if (legacy?.email) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
