"use client";

import { useState, useEffect } from "react";
import { Shield, Mail, Key, Loader2, ArrowRight, Globe, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Email form states
  const [newEmail, setNewEmail] = useState("");
  const [emailConfirmPassword, setEmailConfirmPassword] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailConfirmPassword, setShowEmailConfirmPassword] = useState(false);

  // Global settings state
  const [guestBannerActive, setGuestBannerActive] = useState(true);
  const [guestBannerText, setGuestBannerText] = useState("");
  const [merchantBannerActive, setMerchantBannerActive] = useState(true);
  const [merchantBannerText, setMerchantBannerText] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    async function fetchAdminProfileAndSettings() {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          fetch("/api/admin/auth/me"),
          fetch("/api/public/settings")
        ]);
        const profileData = await profileRes.json();
        const settingsData = await settingsRes.json();
        
        if (profileData.success) {
          setAdminUser(profileData.data);
          setNewEmail(profileData.data.email);
        } else {
          toast.error("Failed to load profile details");
        }

        if (settingsData.success && settingsData.data) {
          setGuestBannerActive(settingsData.data.guestBannerActive);
          setGuestBannerText(settingsData.data.guestBannerText);
          setMerchantBannerActive(settingsData.data.merchantBannerActive ?? true);
          setMerchantBannerText(settingsData.data.merchantBannerText ?? "");
        }
      } catch {
        toast.error("An error occurred while fetching details");
      } finally {
        setLoading(false);
      }
    }
    fetchAdminProfileAndSettings();
  }, []);

  const handleUpdateGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          guestBannerActive, 
          guestBannerText,
          merchantBannerActive,
          merchantBannerText
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Global landing page & merchant banners updated!");
      } else {
        toast.error(data.error || "Failed to update global settings");
      }
    } catch {
      toast.error("Failed to save global settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    if (!emailConfirmPassword) {
      toast.error("Please enter your current password to confirm");
      return;
    }

    setUpdatingEmail(true);
    try {
      const res = await fetch("/api/admin/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          currentPassword: emailConfirmPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Email address updated successfully!");
        setAdminUser((prev) => prev ? { ...prev, email: newEmail } : null);
        setEmailConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to update email");
      }
    } catch {
      toast.error("Profile update failed");
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/admin/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Admin password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading admin settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl text-zinc-900 dark:text-zinc-100">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
          <Shield className="h-7 w-7 text-red-500" /> Admin Profile Settings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Maintain your Super Admin credentials, verify email updates, and update passwords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Settings Card */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Mail className="h-5 w-5 text-red-500" />
            <h2 className="font-bold text-zinc-800 dark:text-zinc-200">Email Address</h2>
          </div>

          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                Current Email Address
              </label>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-100 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                {adminUser?.email}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                New Email Address
              </label>
              <input
                type="email"
                required
                placeholder="admin@newemail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-200"
              />
            </div>

            {newEmail && newEmail !== adminUser?.email && (
              <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                    Confirm Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showEmailConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Enter your current admin password"
                      value={emailConfirmPassword}
                      onChange={(e) => setEmailConfirmPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailConfirmPassword(!showEmailConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors"
                      title={showEmailConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showEmailConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updatingEmail}
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {updatingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Email Address
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Password Settings Card */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Key className="h-5 w-5 text-red-500" />
            <h2 className="font-bold text-zinc-800 dark:text-zinc-200">Change Password</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                Current Password <span className="text-red-500">*</span>
              </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-200"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors"
                title={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-200"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors"
                title={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {updatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Global Banners Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Public Landing Page Banner Card */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Globe className="h-5 w-5 text-red-500" />
            <h2 className="font-bold text-zinc-800 dark:text-zinc-200">Public Website Guest Banner</h2>
          </div>

          <form onSubmit={handleUpdateGlobalSettings} className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-xs font-semibold cursor-pointer w-full text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                id="guest-banner-active"
                checked={guestBannerActive}
                onChange={(e) => setGuestBannerActive(e.target.checked)}
                className="rounded text-red-500 bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="guest-banner-active" className="cursor-pointer text-zinc-700 dark:text-zinc-350">
                Enable Announcement Banner on Website Landing Page
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Banner Text Content</label>
              <textarea
                required
                disabled={!guestBannerActive}
                value={guestBannerText}
                onChange={(e) => setGuestBannerText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-200 disabled:opacity-50 min-h-[80px] resize-none"
                placeholder="e.g. 🎉 Special Launch Offer: Get 20% off physical NFC standee kits!"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Public Banner
            </button>
          </form>
        </div>

        {/* Merchant Dashboard Banner Card */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Shield className="h-5 w-5 text-red-500" />
            <h2 className="font-bold text-zinc-800 dark:text-zinc-200">Merchant Trial Dashboard Banner</h2>
          </div>

          <form onSubmit={handleUpdateGlobalSettings} className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-xs font-semibold cursor-pointer w-full text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                id="merchant-banner-active"
                checked={merchantBannerActive}
                onChange={(e) => setMerchantBannerActive(e.target.checked)}
                className="rounded text-red-500 bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="merchant-banner-active" className="cursor-pointer text-zinc-700 dark:text-zinc-350">
                Enable Announcement Banner for Trial Merchants
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Banner Text Content</label>
              <textarea
                required
                disabled={!merchantBannerActive}
                value={merchantBannerText}
                onChange={(e) => setMerchantBannerText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-200 disabled:opacity-50 min-h-[80px] resize-none"
                placeholder="e.g. 🎉 Exclusive Offer: Get 20% Off your first order of physical NFC Standees!"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Merchant Banner
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
