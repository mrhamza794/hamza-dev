import { getSiteSettings } from "@/lib/siteSettings";
import { sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const settings = await getSiteSettings();

    return sendJson(res, 200, {
      success: true,
      data: {
        siteMaintenance: settings.siteMaintenance,
        maintenanceMessage: settings.maintenanceMessage,
        allowNewContacts: settings.allowNewContacts,
        analyticsEnabled: settings.analyticsEnabled,
      },
    });
  } catch (error) {
    console.error("Site settings API error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}
