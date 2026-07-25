"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signUp, authClient } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
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

  const onSubmit = async (data: RegisterInput) => {
    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        if (result.error.message?.includes("already")) {
          toast.error("An account with this email already exists");
        } else {
          toast.error(result.error.message || "Registration failed");
        }
        return;
      }

      // Create restaurant record using the public registration endpoint
      await fetch("/api/public/register-restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, restaurantName: data.restaurantName }),
      });


      toast.success("Account created! Check your inbox to verify your email.");
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">Create your account</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Start your free Dineo Menu account — no credit card required
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium mb-1.5">
            Full Name
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            placeholder="Rahul Sharma"
            {...register("name")}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Restaurant Name */}
        <div>
          <label htmlFor="reg-restaurant" className="block text-sm font-medium mb-1.5">
            Restaurant Name
          </label>
          <input
            id="reg-restaurant"
            type="text"
            placeholder="Sharma's Kitchen"
            {...register("restaurantName")}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
          {errors.restaurantName && (
            <p className="mt-1.5 text-xs text-destructive">
              {errors.restaurantName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5">
            Email address
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="rahul@sharmas.kitchen"
            {...register("email")}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Mobile */}
        <div>
          <label htmlFor="reg-mobile" className="block text-sm font-medium mb-1.5">
            Mobile Number
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-input bg-muted text-sm text-muted-foreground">
              +91
            </span>
            <input
              id="reg-mobile"
              type="tel"
              autoComplete="tel"
              placeholder="9876543210"
              {...register("mobile")}
              className="flex-1 rounded-r-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
          {errors.mobile && (
            <p className="mt-1.5 text-xs text-destructive">{errors.mobile.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register("password")}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
          <label htmlFor="reg-confirm" className="block text-sm font-medium mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="reg-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              {...register("confirmPassword")}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

        {/* Submit */}
        <button
          id="register-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full gradient-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Creating account..." : "Create Free Account"}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          By registering, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
