"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("dineo_cookie_consent");
    if (!consent) {
      // Small delay for better UX entrance animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("dineo_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("dineo_cookie_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-8 duration-500 ease-out">
      <div className="bg-card/95 border border-border/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col gap-4">
        {/* Subtle top primary highlight bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-sm text-foreground">Cookie Consent</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dineo uses essential cookies to manage your login session, remember your preferences, and track anonymous menu visit counts to maintain system stability.
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={handleDecline}
            className="text-xs font-semibold px-4 py-2 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="text-xs font-bold px-4 py-2 gradient-primary text-white rounded-xl hover:opacity-90 shadow-md transition-opacity cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
