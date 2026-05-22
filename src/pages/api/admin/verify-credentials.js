import { verifyAdminPassword } from "@/lib/adminCredentials";
import { generateCredToken, buildCredCookie } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiErrors";
import { readJsonBody, sendJson, methodNotAllowed, setResponseCookies } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const body = await readJsonBody(req);
    const { email, password } = body;

    if (!email || !password) {
      return sendJson(res, 400, { success: false, error: "Email and password are required" });
    }

    const result = await verifyAdminPassword(email, password);

    if (!result.ok) {
      return sendJson(res, 401, { success: false, error: result.error });
    }

    const credToken = generateCredToken(result.email);
    setResponseCookies(res, [buildCredCookie(credToken, req)]);

    return sendJson(res, 200, {
      success: true,
      message: "Credentials verified. Proceed to OTP.",
      email: result.email,
    });
  } catch (error) {
    return handleApiError(res, error, "Verify credentials");
  }
}
