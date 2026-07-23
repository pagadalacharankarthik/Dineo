"use client";

import { Bell, Search, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { getInitials } from "@/lib/utils";

interface TopbarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onMobileMenuOpen?: () => void;
}

export function Topbar({ user, onMobileMenuOpen }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    setMounted(true);
    fetch("/api/restaurant")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const plan = data.data.planName || "FREE_TRIAL";
          const list = [];
          
          if (plan === "FREE_TRIAL") {
            list.push({ id: "sub", text: "Trial Tier Active: Your free trial tier is active. Upgrade to Pro for custom subdomains and logo branding." });
          } else if (plan === "PRO") {
            list.push({ id: "sub", text: "Professional Tier Active: You have successfully unlocked custom logos, infinite categories, and SVG QR downloads!" });
          } else if (plan === "EARLY_ADOPTER") {
            list.push({ id: "sub", text: "Early Adopter Tier Active: You have unlocked 50 menu items, infinite promo codes, and SVG QR downloads!" });
          } else if (plan === "ENTERPRISE") {
            list.push({ id: "sub", text: "Enterprise Tier Active: Custom settings and dedicated support are enabled for your restaurant." });
          }

          list.push({ id: "profile", text: "Setup checklist: Complete your Restaurant Profile details to activate your custom QR posters." });
          list.push({ id: "stands", text: "Custom Stands: Order premium acrylic QR stands from the Starter Kit page." });

          setNotifications(list);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-background/95 backdrop-blur border-b border-border px-4 sm:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search (placeholder) */}
      <div className="relative hidden sm:flex flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search..."
          className="w-full rounded-xl border border-input bg-muted pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white px-0.5 shadow-sm">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-76 sm:w-80 bg-card border border-border rounded-2xl shadow-xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-1 duration-200 text-foreground">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-xs">Alerts & Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No new notifications</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] leading-relaxed relative group hover:bg-muted/75 transition-colors">
                      <p className="pr-4">{n.text}</p>
                      <button 
                        onClick={() => handleDismiss(n.id)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
              {getInitials(user.name)}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[140px]">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
