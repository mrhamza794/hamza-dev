import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function useAdminChartTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return {
    gridStroke: isDark ? "rgba(148,163,184,0.2)" : "rgba(148,163,184,0.35)",
    axisStroke: isDark ? "#64748b" : "#94a3b8",
    tooltipContent: isDark
      ? {
          background: "#1e293b",
          border: "1px solid #475569",
          borderRadius: 12,
          color: "#f1f5f9",
        }
      : {
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          color: "#0f172a",
        },
    labelStyle: isDark ? { color: "#f1f5f9" } : { color: "#0f172a" },
  };
}
