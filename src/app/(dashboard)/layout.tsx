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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

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
    await signOut();
    router.replace("/login");
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
      
      {/* Suspension banner */}
      {isSuspended && (
        <div className="bg-amber-600 text-zinc-950 font-bold text-center px-4 py-2 text-xs flex items-center justify-center gap-2 relative z-50 animate-pulse shadow-md">
          ⚠️ Your restaurant menu is suspended. It is hidden from public view. Please contact the administrator.
        </div>
      )}

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
        <Topbar user={user} onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
