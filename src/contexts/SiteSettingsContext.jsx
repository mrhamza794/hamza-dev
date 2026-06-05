import { createContext, useContext, useEffect, useState } from "react";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/siteSettingsDefaults";

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children, initialSettings }) {
  const [settings, setSettings] = useState(initialSettings ?? SITE_SETTINGS_DEFAULTS);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      })
      .catch(console.error);
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }
  return context;
}
