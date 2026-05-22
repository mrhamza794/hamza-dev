import { COOKIE_NAME, CRED_COOKIE_NAME, buildClearCookie } from "@/lib/adminAuth";
import { sendJson, methodNotAllowed, setResponseCookies } from "@/lib/pagesApi";

export default function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  setResponseCookies(res, [
    buildClearCookie(COOKIE_NAME, req),
    buildClearCookie(CRED_COOKIE_NAME, req),
  ]);

  return sendJson(res, 200, { success: true });
}
