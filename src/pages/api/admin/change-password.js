import { changeAdminPassword, getAdminCredentials } from "@/lib/adminCredentials";
import { requireAdmin } from "@/lib/requireAdmin";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!requireAdmin(req, res)) return;

  try {
    const body = await readJsonBody(req);
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendJson(res, 400, {
        success: false,
        error: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return sendJson(res, 400, {
        success: false,
        error: "New passwords do not match",
      });
    }

    const result = await changeAdminPassword(currentPassword, newPassword);

    if (!result.ok) {
      return sendJson(res, 400, { success: false, error: result.error });
    }

    const { email } = await getAdminCredentials();

    return sendJson(res, 200, {
      success: true,
      message: "Password updated successfully",
      email,
    });
  } catch (error) {
    console.error("Change password error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}
