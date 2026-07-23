"use client";

import { useEffect, useState } from "react";
import { Cookie, Settings, ShieldCheck, X } from "lucide-react";

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("dineo_cookie_consent");
    if (!consent) {
      // 1.5 second delay before sliding up the banner
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("dineo_cookie_consent", "accepted");
    localStorage.setItem("dineo_analytics_consent", "true");
    setIsOpen(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("dineo_cookie_consent", "rejected");
    localStorage.setItem("dineo_analytics_consent", "false");
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("dineo_cookie_consent", "custom");
    localStorage.setItem("dineo_analytics_consent", analyticsConsent ? "true" : "false");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-background/90 dark:bg-zinc-950/90 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-5 sm:p-6 space-y-4">
        {/* Banner Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Cookie className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-extrabold text-sm text-foreground">We use cookies 🍪</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-lg hover:bg-muted"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {!showCustomize ? (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Hi, this website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleAcceptAll}
                className="flex-1 text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-colors cursor-pointer"
              >
                Accept all
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border cursor-pointer"
              >
                Reject all
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                className="py-2.5 px-4 text-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5" />
                Customize
              </button>
            </div>
          </>
        ) : (
          /* Customize Panel */
          <div className="space-y-4 pt-1 animate-in fade-in duration-300">
            <div className="space-y-3">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">Essential Cookies</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Always Active</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Required for the website to run properly (sessions, security checks, theme routing).
                  </p>
                </div>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">Analytics & Performance</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Helps us understand how visitors interact with the website to improve the product experience.
                  </p>
                </div>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-card text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Customize Actions */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setShowCustomize(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                onClick={handleSavePreferences}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
