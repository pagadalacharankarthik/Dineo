"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to resend verification email");
      } else {
        toast.success("Verification link resent successfully! Check your inbox.");
        setCooldown(60); // 60s cooldown
      }
    } catch {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6 text-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center animate-bounce-slow">
          <Mail className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to your email address
          </p>
        </div>
      </div>

      <div className="bg-muted/40 border border-border p-5 rounded-2xl text-center space-y-3">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          Registered Email
        </p>
        <p className="text-base font-bold text-foreground break-all select-all">
          {email}
        </p>
        <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          <span>Onboarding invitation triggered</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Please check your email client (including Spam/Promotions folders) and click the confirmation link to complete registration and submit your workspace for review.
        </p>

        <button
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-primary/10 disabled:opacity-50 cursor-pointer"
        >
          {resending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend Verification Email"}
        </button>

        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center gap-2 bg-zinc-155 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
        >
          Continue to Login
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Loading verification portal...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
