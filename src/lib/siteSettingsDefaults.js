export const SITE_SETTINGS_DEFAULTS = {
  siteMaintenance: false,
  maintenanceMessage: "Site under maintenance. Coming back soon!",
  allowNewContacts: true,
  analyticsEnabled: true,
};

export function normalizeSiteSettings(settingsMap = {}) {
  const message =
    typeof settingsMap.maintenanceMessage === "string"
      ? settingsMap.maintenanceMessage.trim()
      : "";

  return {
    siteMaintenance: settingsMap.siteMaintenance === true,
    maintenanceMessage: message || SITE_SETTINGS_DEFAULTS.maintenanceMessage,
    allowNewContacts: settingsMap.allowNewContacts !== false,
    analyticsEnabled: settingsMap.analyticsEnabled !== false,
  };
}
