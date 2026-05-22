import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";
import { getCookie, sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const token = getCookie(req, COOKIE_NAME);
  const decoded = verifyToken(token);

  if (!decoded) {
    return sendJson(res, 401, { authenticated: false });
  }

  return sendJson(res, 200, {
    authenticated: true,
    email: decoded.email,
  });
}
