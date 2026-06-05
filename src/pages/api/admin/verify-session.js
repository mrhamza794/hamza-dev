import { getServerSession } from "next-auth/next";
import { authOptions, getAdminEmail } from "@/lib/auth";
import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";
import { getCookie, sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const session = await getServerSession(req, res, authOptions);
  const allowedGoogle = getAdminEmail();
  const googleEmail = session?.user?.email?.toLowerCase();

  if (allowedGoogle && googleEmail === allowedGoogle) {
    return sendJson(res, 200, {
      authenticated: true,
      email: googleEmail,
      provider: "google",
    });
  }

  const legacyToken = getCookie(req, COOKIE_NAME);
  const decoded = verifyToken(legacyToken);

  if (decoded?.role === "admin" && decoded?.email) {
    return sendJson(res, 200, {
      authenticated: true,
      email: decoded.email,
      provider: "password",
    });
  }

  return sendJson(res, 401, { authenticated: false });
}
