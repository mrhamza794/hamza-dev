import connectDB from "@/lib/mongodb";
import { AdminSettings } from "@/lib/models/AdminSession";
import { normalizeSiteSettings } from "@/lib/siteSettingsDefaults";

const SETTING_KEYS = [
  "siteMaintenance",
  "maintenanceMessage",
  "allowNewContacts",
  "analyticsEnabled",
];

export { SITE_SETTINGS_DEFAULTS, normalizeSiteSettings } from "@/lib/siteSettingsDefaults";

export async function getSiteSettings() {
  try {
    await connectDB();

    const rows = await AdminSettings.find({ key: { $in: SETTING_KEYS } }).lean();
    const map = {};
    rows.forEach((row) => {
      map[row.key] = row.value;
    });

    return normalizeSiteSettings(map);
  } catch (error) {
    console.error("[siteSettings] MongoDB unavailable, using defaults:", error.message);
    return normalizeSiteSettings({});
  }
}
