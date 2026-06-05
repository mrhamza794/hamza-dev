import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";
import { AdminSettings } from "@/lib/models/AdminSession";
import { getSiteSettings } from "@/lib/siteSettings";
import { requireAdmin } from "@/lib/requireAdmin";
import { getAdminCredentials } from "@/lib/adminCredentials";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

async function handleGet(req, res) {
  try {
    await connectDB();

    const siteSettings = await getSiteSettings();
    const { email: adminEmail } = await getAdminCredentials();

    return sendJson(res, 200, {
      success: true,
      data: {
        adminEmail: adminEmail || "",
        ...siteSettings,
      },
    });
  } catch {
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}

async function handlePatch(req, res) {
  try {
    await connectDB();

    const body = await readJsonBody(req);
    const allowedKeys = [
      "siteMaintenance",
      "maintenanceMessage",
      "allowNewContacts",
      "analyticsEnabled",
    ];

    for (const [key, value] of Object.entries(body)) {
      if (!allowedKeys.includes(key)) continue;
      await AdminSettings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
    }

    return sendJson(res, 200, { success: true, message: "Settings updated" });
  } catch {
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}

async function handleDelete(req, res) {
  try {
    await connectDB();
    const target = req.query.target;

    if (target === "visitors") {
      const result = await Visitor.deleteMany({});
      return sendJson(res, 200, {
        success: true,
        message: `Deleted ${result.deletedCount} visitor records`,
      });
    }

    return sendJson(res, 400, { success: false, error: "Invalid target" });
  } catch {
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "PATCH") return handlePatch(req, res);
  if (req.method === "DELETE") return handleDelete(req, res);

  return methodNotAllowed(res, ["GET", "PATCH", "DELETE"]);
}
