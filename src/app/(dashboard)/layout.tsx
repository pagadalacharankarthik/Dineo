"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { OnboardingTour } from "@/components/shared/OnboardingTour";
import { BetaFeedbackModal } from "@/components/dashboard/BetaFeedbackModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.createdAt) {
      const createdTime = new Date(session.user.createdAt).getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const isOldEnough = (new Date().getTime() - createdTime) >= sevenDaysMs;
      
      const oldDismissed = localStorage.getItem("dineo_feedback_dismissed") === "true";
      const dismissedTimeStr = localStorage.getItem("dineo_feedback_dismissed_time");
      let isDismissed = false;
      
      if (oldDismissed && !dismissedTimeStr) {
        // If they already dismissed before, set a baseline timestamp so it starts counting down
        localStorage.setItem("dineo_feedback_dismissed_time", new Date().getTime().toString());
        isDismissed = true;
      } else if (dismissedTimeStr) {
        const dismissedTime = parseInt(dismissedTimeStr, 10);
        const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
        if (new Date().getTime() - dismissedTime < fourteenDaysMs) {
          isDismissed = true;
        }
      }
      
      if (isOldEnough && !isDismissed) {
        setShowFeedbackBanner(true);
      }
    }
  }, [session]);

  const dismissFeedbackBanner = () => {
    localStorage.setItem("dineo_feedback_dismissed", "true");
    localStorage.setItem("dineo_feedback_dismissed_time", new Date().getTime().toString());
    setShowFeedbackBanner(false);
  };

  const handleFeedbackSuccess = () => {
    localStorage.setItem("dineo_feedback_dismissed", "true");
    localStorage.setItem("dineo_feedback_dismissed_time", new Date().getTime().toString());
    setShowFeedbackBanner(false);
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/restaurant")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.data?.isSuspended) {
              setIsSuspended(true);
            }
            // If the restaurant is not active, set pending approval to true
            if (data.data && !data.data.isActive) {
              setIsPendingApproval(true);
            }
          }
        })
        .catch((err) => console.error("Error checking suspension:", err));
    }
  }, [session]);

  const handleLogout = async () => {
    const { signOut } = await import("@/lib/auth-client");
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        }
      }
    });
  };

  if (isPending) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  if (!session) return null;

  if (isPendingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 text-center text-foreground transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl">⏳</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Workspace Under Review</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Thank you for registering! Your restaurant details have been successfully received and are currently under review by our administrator.
            </p>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Status:</span>
              <span className="font-bold text-orange-500">Under Review</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Timeframe:</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Under 24 hours</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 leading-normal">
            An email notification will be sent to <strong>{session.user.email}</strong> once your account has been approved. If you need urgent assistance, contact us at: <a href="mailto:charanlabssupport@gmail.com" className="text-orange-500 hover:underline">charanlabssupport@gmail.com</a>
          </p>

          <button
            onClick={handleLogout}
            className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
          >
            Logout Session
          </button>
        </div>
      </div>
    );
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour userCreatedAt={session?.user?.createdAt} />
      
      {/* Sidebar */}
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Suspension banner */}
        {isSuspended && (
          <div className="bg-amber-600 text-zinc-950 font-bold text-center px-4 py-2 text-xs flex items-center justify-center gap-2 relative z-50 animate-pulse shadow-md">
            ⚠️ Your restaurant menu is suspended. It is hidden from public view. Please contact the administrator.
          </div>
        )}

        {/* Beta Feedback Banner */}
        {showFeedbackBanner && (
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white px-4 py-3 text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 relative z-40 shadow-md">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="text-base">✨</span>
              <span>
                <strong>Dineo Menu Beta Program:</strong> You&apos;ve been using Dineo Menu for 7 days! We&apos;d love to hear your feedback to help us build a better experience.
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="bg-white text-orange-600 hover:bg-orange-50 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm border-none"
              >
                Give Feedback
              </button>
              <button
                onClick={dismissFeedbackBanner}
                className="bg-black/10 hover:bg-black/20 text-white/90 border border-white/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <Topbar user={user} onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <BetaFeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        onSubmitSuccess={handleFeedbackSuccess} 
      />
    </div>
  );
}
