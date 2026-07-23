"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dineo Application Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-background p-4 font-sans">
      <div className="max-w-md w-full bg-card/60 backdrop-blur-md border border-border p-8 rounded-3xl shadow-xl text-center space-y-6">
        <div className="h-16 w-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
          <AlertOctagon className="h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-foreground">Something went wrong!</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred while loading this page. Please try refreshing or return to the main dashboard.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try Refreshing Page
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-background border border-border hover:bg-muted text-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Home Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
