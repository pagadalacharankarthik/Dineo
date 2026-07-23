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
  Settings
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="dark min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-red-500" />
          <span className="font-bold text-sm tracking-wider uppercase text-zinc-200">Super Admin</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-zinc-400 hover:text-zinc-200 focus:outline-none"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-zinc-900/60 border-r border-zinc-800/80 backdrop-blur-md flex flex-col z-40
        md:h-screen sticky top-0
      `}>
        {/* Brand / Logo */}
        <div className="p-6 border-b border-zinc-800/80 hidden md:flex items-center gap-2.5">
          <div className="bg-red-950/40 border border-red-800/30 p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-bold tracking-wider uppercase text-xs text-zinc-200">Super Admin</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-red-550/10 text-red-400 border-l-2 border-red-500 pl-3.5 shadow-inner" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-red-400" : "text-zinc-500"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-zinc-800/80">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-950/10 rounded-xl transition-all duration-200"
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
