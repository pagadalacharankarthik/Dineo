"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/lib/auth-client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const passwordValue = watch("password") || "";

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-muted" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (pass.length < 6) {
      return { score: 1, label: "Weak", color: "bg-red-500 text-red-500" };
    }

    if (score <= 2) {
      return { score: 1, label: "Weak", color: "bg-red-500 text-red-500" };
    } else if (score <= 4) {
      return { score: 2, label: "Medium", color: "bg-amber-500 text-amber-500" };
    } else {
      return { score: 3, label: "Strong", color: "bg-emerald-500 text-emerald-500" };
    }
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      // Verify that the user is not reusing their old password
      const checkRes = await fetch("/api/auth/check-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token, password: data.password }),
      });
      const checkData = await checkRes.json();
      if (checkData.success && checkData.isSame) {
        toast.error("Please enter a new password. You cannot reuse your current password.");
        return;
      }

      const result = await resetPassword({
        newPassword: data.password,
        token: data.token,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to reset password");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-extrabold mb-3">Password reset!</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Your password has been successfully updated. Redirecting to login...
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gradient-primary text-white font-semibold py-2.5 px-6 rounded-xl hover:opacity-90 transition-opacity"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-extrabold mb-3">Invalid reset link</h1>
        <p className="text-muted-foreground text-sm mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-primary hover:underline text-sm font-medium"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">Reset your password</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} />

        {/* New Password */}
        <div>
          <label htmlFor="reset-password" className="block text-sm font-medium mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register("password")}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordValue && (
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Password strength:</span>
                <span className={strength.label === "Weak" ? "text-red-500" : strength.label === "Medium" ? "text-amber-500" : "text-emerald-500"}>
                  {strength.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-1">
                <div className={`h-full rounded-full transition-colors ${strength.score >= 1 ? (strength.label === "Weak" ? "bg-red-500" : strength.label === "Medium" ? "bg-amber-500" : "bg-emerald-500") : "bg-muted"}`} />
                <div className={`h-full rounded-full transition-colors ${strength.score >= 2 ? (strength.label === "Medium" ? "bg-amber-500" : "bg-emerald-500") : "bg-muted"}`} />
                <div className={`h-full rounded-full transition-colors ${strength.score >= 3 ? "bg-emerald-500" : "bg-muted"}`} />
              </div>
            </div>
          )}
          {errors.password && (
            <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="reset-confirm" className="block text-sm font-medium mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="reset-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat new password"
              {...register("confirmPassword")}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          id="reset-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full gradient-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
