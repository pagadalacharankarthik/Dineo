"use client";

import { useState, useEffect } from "react";
import { Shield, Mail, Key, Loader2, ArrowRight, Globe } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Email form states
  const [newEmail, setNewEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

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

  const handleSendOtp = async () => {
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch("/api/admin/profile/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        toast.success("Verification OTP code sent to " + newEmail);
      } else {
        toast.error(data.error || "Failed to send OTP code");
      }
    } catch {
      toast.error("Failed to request verification code");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    if (!otpCode) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }

    setUpdatingEmail(true);
    try {
      const res = await fetch("/api/admin/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Email address updated successfully!");
        setAdminUser((prev) => prev ? { ...prev, email: newEmail } : null);
        setOtpSent(false);
        setOtpCode("");
      } else {
        toast.error(data.error || "Failed to verify and update email");
      }
    } catch {
      toast.error("Verification failed");
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
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 text-zinc-100">
          <Shield className="h-7 w-7 text-red-500" /> Admin Profile Settings
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Maintain your Super Admin credentials, verify email updates, and update passwords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Settings Card */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Mail className="h-5 w-5 text-red-500" />
            <h2 className="font-bold text-zinc-200">Email Address</h2>
          </div>

          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">
                Current Email Address
              </label>
              <p className="text-sm font-semibold text-zinc-100 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                {adminUser?.email}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">
                New Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="admin@newemail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-200"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || newEmail === adminUser?.email}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {sendingOtp && <Loader2 className="w-3 h-3 animate-spin" />}
                  {otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="space-y-4 pt-2 border-t border-zinc-800 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">
                    Enter 6-Digit OTP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-mono text-center tracking-widest text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatingEmail}
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-650 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {updatingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify & Save Email
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Password Settings Card */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Key className="h-5 w-5 text-red-500" />
            <h2 className="font-bold text-zinc-200">Change Password</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-200"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full inline-flex items-center justify-center gap-2 bg-red-650 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
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
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Globe className="h-5 w-5 text-red-500" />
            <h2 className="font-bold text-zinc-200">Public Website Guest Banner</h2>
          </div>

          <form onSubmit={handleUpdateGlobalSettings} className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs font-semibold cursor-pointer w-full">
              <input
                type="checkbox"
                id="guest-banner-active"
                checked={guestBannerActive}
                onChange={(e) => setGuestBannerActive(e.target.checked)}
                className="rounded text-red-500 bg-zinc-900 border-zinc-800 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="guest-banner-active" className="cursor-pointer text-zinc-350">
                Enable Announcement Banner on Website Landing Page
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Banner Text Content</label>
              <textarea
                required
                disabled={!guestBannerActive}
                value={guestBannerText}
                onChange={(e) => setGuestBannerText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-200 disabled:opacity-50 min-h-[80px] resize-none"
                placeholder="e.g. 🎉 Special Launch Offer: Get 20% off physical NFC standee kits!"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center justify-center gap-2 bg-red-650 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Public Banner
            </button>
          </form>
        </div>

        {/* Merchant Dashboard Banner Card */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Shield className="h-5 w-5 text-red-500" />
            <h2 className="font-bold text-zinc-200">Merchant Trial Dashboard Banner</h2>
          </div>

          <form onSubmit={handleUpdateGlobalSettings} className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs font-semibold cursor-pointer w-full">
              <input
                type="checkbox"
                id="merchant-banner-active"
                checked={merchantBannerActive}
                onChange={(e) => setMerchantBannerActive(e.target.checked)}
                className="rounded text-red-500 bg-zinc-900 border-zinc-800 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="merchant-banner-active" className="cursor-pointer text-zinc-350">
                Enable Announcement Banner for Trial Merchants
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Banner Text Content</label>
              <textarea
                required
                disabled={!merchantBannerActive}
                value={merchantBannerText}
                onChange={(e) => setMerchantBannerText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-sm focus:outline-none focus:border-red-500 text-zinc-200 disabled:opacity-50 min-h-[80px] resize-none"
                placeholder="e.g. 🎉 Exclusive Offer: Get 20% Off your first order of physical NFC Standees!"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center justify-center gap-2 bg-red-650 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
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
