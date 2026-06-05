import { getServerSession } from "next-auth/next";
import { authOptions, getAdminEmail } from "@/lib/auth";
import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";
import { getCookie, sendJson } from "@/lib/pagesApi";

export async function requireAdmin(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const allowedGoogle = getAdminEmail();
  const googleEmail = session?.user?.email?.toLowerCase();

  if (allowedGoogle && googleEmail === allowedGoogle) {
    return { email: googleEmail, provider: "google" };
  }

  const legacyToken = getCookie(req, COOKIE_NAME);
  const decoded = verifyToken(legacyToken);

  if (decoded?.role === "admin" && decoded?.email) {
    return { email: decoded.email, provider: "password" };
  }

  sendJson(res, 401, { success: false, error: "Unauthorized" });
  return null;
}
