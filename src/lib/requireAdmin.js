import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";
import { getCookie, sendJson } from "@/lib/pagesApi";

export function requireAdmin(req, res) {
  const token = getCookie(req, COOKIE_NAME);
  const decoded = verifyToken(token);
  if (!decoded) {
    sendJson(res, 401, { success: false, error: "Unauthorized" });
    return null;
  }
  return decoded;
}
