"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tag,
  QrCode,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MenuSquare,
  BarChart3,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/categories",
    label: "Categories",
    icon: Tag,
  },
  {
    href: "/menu",
    label: "Menu Items",
    icon: MenuSquare,
  },
  {
    href: "/coupons",
    label: "Coupons & Offers",
    icon: Ticket,
  },
  {
    href: "/qr-code",
    label: "QR Code",
    icon: QrCode,
  },
  {
    href: "/qr-kit",
    label: "QR Starter Kit",
    icon: ShoppingBag,
  },
  {
    href: "/restaurant",
    label: "Restaurant Profile",
    icon: UtensilsCrossed,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col z-40 transition-all duration-300",
        collapsed ? "lg:w-16" : "lg:w-64",
        mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border">
         <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 overflow-hidden",
            collapsed && !mobileOpen && "justify-center"
          )}
        >
          {collapsed && !mobileOpen ? (
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <QrCode className="h-4 w-4 text-white" />
            </div>
          ) : (
            <>
              <Image
                src="/logo-light.png"
                alt="Dineo Logo"
                width={100}
                height={32}
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                alt="Dineo Logo"
                width={100}
                height={32}
                className="h-8 w-auto hidden dark:block"
              />
            </>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                id={`tour-${item.href.replace("/", "")}`}
                title={collapsed ? item.label : undefined}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && !mobileOpen && "justify-center"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <button
          onClick={handleSignOut}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full",
            collapsed && !mobileOpen && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {(!collapsed || mobileOpen) && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-muted transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
