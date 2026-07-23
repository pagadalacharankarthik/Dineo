"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Store, 
  QrCode, 
  Mail, 
  LogOut, 
  Menu, 
  X,
  Settings,
  Sun,
  Moon
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [badgeCounts, setBadgeCounts] = useState({ unreadContacts: 0, pendingKits: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    async function fetchBadgeCounts() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success && data.data) {
          setBadgeCounts({
            unreadContacts: data.data.unreadContacts ?? 0,
            pendingKits: data.data.pendingKits ?? 0,
          });
        }
      } catch (err) {
        console.error("Failed to load admin badge counts:", err);
      }
    }

    fetchBadgeCounts();
    const interval = setInterval(fetchBadgeCounts, 15000); // refresh counts every 15 seconds
    return () => clearInterval(interval);
  }, [pathname]);

  // Skip layout wrapper for the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Successfully logged out");
        router.push("/admin/login");
        router.refresh();
      }
    } catch {
      toast.error("Logout failed");
    }
  };

  const navLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/restaurants", label: "Restaurants", icon: Store },
    { href: "/admin/qr-kits", label: "QR Kit Requests", icon: QrCode },
    { href: "/admin/contact", label: "Contact Enquiries", icon: Mail },
    { href: "/admin/settings", label: "Profile Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-red-500" />
          <span className="font-bold text-sm tracking-wider uppercase text-zinc-800 dark:text-zinc-200">Super Admin</span>
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 focus:outline-none"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-white dark:bg-zinc-900/60 border-r border-zinc-200 dark:border-zinc-800/80 backdrop-blur-md flex flex-col z-40
        md:h-screen sticky top-0 transition-colors duration-200
      `}>
        {/* Brand / Logo */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/80 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-950/10 dark:bg-red-950/40 border border-red-200 dark:border-red-800/30 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-red-500" />
            </div>
            <span className="font-bold tracking-wider uppercase text-xs text-zinc-800 dark:text-zinc-200">Super Admin</span>
          </div>
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            let badge: number | null = null;
            if (link.href === "/admin/contact") {
              badge = badgeCounts.unreadContacts;
            } else if (link.href === "/admin/qr-kits") {
              badge = badgeCounts.pendingKits;
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-l-2 border-red-500 pl-3.5 shadow-inner" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-red-500 dark:text-red-400" : "text-zinc-400 dark:text-zinc-500"}`} />
                <span className="flex-1">{link.label}</span>
                {badge !== null && badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black h-5 px-1.5 min-w-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 px-4 py-3 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout Session
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
