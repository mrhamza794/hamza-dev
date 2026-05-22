import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function AdminThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`h-9 w-9 rounded-lg ${className}`} aria-hidden />;
  }

  return (
    <button
      type="button"
      aria-label="Toggle light and dark mode"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`rounded-lg p-2 transition-all hover:scale-105 ${className} text-slate-600 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-white/10`}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
