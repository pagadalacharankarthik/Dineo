"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, RefreshCw, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code.");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/public/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Email verified successfully! 🎉");
        setVerified(true);
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email)}`);
        }, 1800);
      } else {
        toast.error(data.error || "Verification failed. Invalid code.");
      }
    } catch {
      toast.error("Something went wrong. Please check your internet connection.");
    } finally {
      setVerifying(false);
    }
  };

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
        toast.success("A new 6-digit OTP code has been sent! Check your inbox.");
        setCooldown(60); // 60s cooldown
      }
    } catch {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="space-y-6 text-center text-foreground animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black">Email Verified!</h1>
          <p className="text-sm text-muted-foreground">
            Thank you. Your email address has been successfully verified.
          </p>
        </div>
        <div className="text-xs text-muted-foreground animate-pulse">
          Redirecting you to the login page...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
          <Mail className="h-8 w-8 text-orange-500" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight">Enter OTP Code</h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit verification code to your email
          </p>
        </div>
      </div>

      <div className="bg-muted/40 border border-border p-4 rounded-2xl text-center space-y-2.5">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          Sent to
        </p>
        <p className="text-sm font-bold text-foreground break-all">
          {email}
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase text-center">
            Enter 6-Digit Verification Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full tracking-[1em] text-center font-extrabold text-2xl py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={verifying || code.length !== 6}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-primary/10 disabled:opacity-50 cursor-pointer"
        >
          {verifying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Verify Account
        </button>
      </form>

      <div className="space-y-4 pt-2 border-t border-border/60">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Didn't receive the verification code? Check spam or resend below.
        </p>

        <button
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="w-full inline-flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          {resending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Verification Code"}
        </button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-xs text-primary hover:underline font-semibold"
          >
            Back to Login Page
          </Link>
        </div>
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
