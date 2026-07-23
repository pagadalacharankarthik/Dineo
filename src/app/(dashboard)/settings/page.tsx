"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, User, Lock, Moon, Sun, Monitor } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { profileSchema, changePasswordSchema, type ProfileInput, type ChangePasswordInput } from "@/lib/validations/user";
import { getInitials } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Input({
  id,
  type = "text",
  placeholder,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
      {...props}
    />
  );
}

export default function SettingsPage() {
  const { data: session, refetch } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("FREE_TRIAL");

  useEffect(() => {
    setMounted(true);
    if (session) {
      fetch("/api/restaurant")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.planName) {
            setCurrentPlan(data.data.planName);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  // Profile form
  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name,
        mobile: (session.user as { mobile?: string }).mobile || "",
        image: session.user.image || "",
      });
    }
  }, [session, profileForm]);

  // Password form
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onProfileSubmit = async (data: ProfileInput) => {
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error || "Failed to update profile");
        return;
      }
      await refetch();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    try {
      const result = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to change password");
        return;
      }

      passwordForm.reset();
      toast.success("Password changed successfully!");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>

      {/* Profile Picture */}
      <div className="flex items-center gap-4 p-6 rounded-2xl border border-border bg-card">
        {session?.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name}
            className="h-16 w-16 rounded-full object-cover border-2 border-border"
          />
        ) : (
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-white text-xl font-bold">
            {getInitials(session?.user.name || "U")}
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <p className="font-bold text-lg">{session?.user.name}</p>
            {currentPlan && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {currentPlan === "FREE_TRIAL" ? "Starter Plan" : 
                 currentPlan === "EARLY_ADOPTER" ? "Early Adopter" : 
                 currentPlan === "PRO" ? "Professional Plan" : "Enterprise"}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{session?.user.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Restaurant Owner
          </p>
        </div>
      </div>

      {/* Profile Settings */}
      <SectionCard title="Profile Information" icon={User}>
        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-name" className="block text-sm font-medium mb-1.5">
                Full Name
              </label>
              <Input
                id="settings-name"
                placeholder="Your full name"
                {...profileForm.register("name")}
              />
              {profileForm.formState.errors.name && (
                <p className="mt-1.5 text-xs text-destructive">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="settings-mobile" className="block text-sm font-medium mb-1.5">
                Mobile Number
              </label>
              <Input
                id="settings-mobile"
                type="tel"
                placeholder="9876543210"
                {...profileForm.register("mobile")}
              />
              {profileForm.formState.errors.mobile && (
                <p className="mt-1.5 text-xs text-destructive">
                  {profileForm.formState.errors.mobile.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="settings-image" className="block text-sm font-medium mb-1.5">
              Profile Image URL
            </label>
            <Input
              id="settings-image"
              placeholder="https://..."
              {...profileForm.register("image")}
            />
            {profileForm.formState.errors.image && (
              <p className="mt-1.5 text-xs text-destructive">
                {profileForm.formState.errors.image.message}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              id="settings-profile-save"
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {profileForm.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save Profile
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Password Settings */}
      <SectionCard title="Change Password" icon={Lock}>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="space-y-4"
        >
          <div>
            <label htmlFor="settings-current-pw" className="block text-sm font-medium mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Input
                id="settings-current-pw"
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                {...passwordForm.register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-1.5 text-xs text-destructive">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-new-pw" className="block text-sm font-medium mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="settings-new-pw"
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  {...passwordForm.register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="mt-1.5 text-xs text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="settings-confirm-pw" className="block text-sm font-medium mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="settings-confirm-pw"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat new password"
                  {...passwordForm.register("confirmNewPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmNewPassword && (
                <p className="mt-1.5 text-xs text-destructive">
                  {passwordForm.formState.errors.confirmNewPassword.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              id="settings-password-save"
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {passwordForm.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Change Password
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Theme Settings */}
      <SectionCard title="Theme Preference" icon={Monitor}>
        <p className="text-sm text-muted-foreground">
          Choose how Dineo looks for you.
        </p>
        {mounted && (
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${theme === option.value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${theme === option.value ? "text-primary" : "text-muted-foreground"}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
