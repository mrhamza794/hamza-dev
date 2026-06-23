import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Settings,
  MapPin,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Home,
} from "lucide-react";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/visitors", icon: Users, label: "Visitors" },
  { href: "/admin/contacts", icon: MessageSquare, label: "Contact Us" },
  { href: "/admin/game", icon: Gamepad2, label: "Game Analytics" },
  { href: "/admin/leads", icon: MapPin, label: "OSM Leads" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = router.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isLoginPage = pathname === "/admin";

  useEffect(() => {
    if (isLoginPage) return;

    fetch("/api/admin/verify-session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) router.replace("/admin");
        else setAdminEmail(data.email);
      })
      .catch(() => router.replace("/admin"));
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    await signOut({ callbackUrl: "/admin" });
  };

  if (isLoginPage) return children;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-200 p-6 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-blue-600">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">HC Admin</div>
              <div className="max-w-[140px] truncate text-xs text-slate-500 dark:text-slate-400">{adminEmail}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActive
                      ? "border border-purple-500/30 bg-purple-600/15 text-purple-700 dark:bg-purple-600/20 dark:text-purple-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-white/8">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 transition-all hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
          >
            <LogOut size={20} />
            <span className="font-medium">{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden md:ml-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1">
            <h1 className="font-semibold text-slate-900 capitalize dark:text-white">
              {navItems.find((n) => n.href === pathname)?.label || "Admin"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <AdminThemeToggle />
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:flex dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <Home size={16} />
              Home
            </Link>
            <div className="hidden text-xs text-slate-500 sm:block dark:text-slate-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        <main className="admin-page min-w-0 flex-1 overflow-x-hidden bg-slate-100 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
