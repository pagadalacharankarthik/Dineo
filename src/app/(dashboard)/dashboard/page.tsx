"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Tag,
  QrCode,
  ScanLine,
  ArrowRight,
  Building2,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Download,
  Printer,
  Copy,
  Share2,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface DashboardStats {
  hasRestaurant: boolean;
  restaurantName: string | null;
  restaurantSlug: string | null;
  publicUrl: string | null;
  totalCategories: number;
  totalMenuItems: number;
  availableItems: number;
  outOfStockItems: number;
  qrStatus: string;
  qrCodeId: string | null;
  todayScans: number;
  totalQrScans: number;
  qrDownloads: number;
  isActive: boolean;
  showTrialBanner: boolean;
  showOfferBanner: boolean;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const firstName = session?.user.name?.split(" ")[0] || "there";
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleCopyUrl = async () => {
    if (!stats?.publicUrl) return;
    try {
      await navigator.clipboard.writeText(stats.publicUrl);
      toast.success("Public menu URL copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const handleShareMenu = async () => {
    if (!stats?.publicUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${stats.restaurantName || "Our"} Menu`,
          text: `Check out our digital menu on Dineo!`,
          url: stats.publicUrl,
        });
      } catch (err) {
        // Ignored or user cancelled
      }
    } else {
      handleCopyUrl();
    }
  };

  const handlePrintQR = () => {
    if (!stats?.qrCodeId) {
      toast.error("QR Code not ready yet. Please setup your restaurant details.");
      return;
    }
    // Open the QR print dialog or format download
    const printWindow = window.open(`/api/qr/download?qrId=${stats.qrCodeId}&format=pdf`, "_blank");
    if (printWindow) {
      printWindow.focus();
    } else {
      toast.error("Popup blocked! Please allow popups to open PDF.");
    }
  };

  if (!loading && !stats?.hasRestaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-lg mx-auto text-center space-y-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 shadow-inner">
          <Building2 className="h-12 w-12 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome to Dineo, {firstName}! 🚀
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's get your digital menu up and running. First, you must upload your restaurant logo and add your full contact details.
          </p>
        </div>
        <Link
          href="/restaurant"
          className="inline-flex items-center gap-2 gradient-primary text-white font-bold px-8 py-4 rounded-2xl text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full justify-center"
        >
          Setup Restaurant Account <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Promotion Banners */}
      {stats?.showTrialBanner && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold flex items-center justify-between gap-4 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <p>
              Your restaurant menu is currently on the <strong>Free Trial Plan</strong>. Upgrade your subscription to keep scan metrics active and customize your QR codes!
            </p>
          </div>
          <Link
            href="/subscription"
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shrink-0 text-center"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {stats?.showOfferBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold flex items-center justify-between gap-4 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <p>
              Exclusive Offer: Get <strong>20% Off</strong> your first order of physical NFC Table Standees! Request your kit today.
            </p>
          </div>
          <Link
            href="/qr-kit"
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors shrink-0 text-center"
          >
            Claim Offer
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {greeting()}, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here&apos;s a quick overview of your Dineo QR Menu System.
          </p>
        </div>
        {stats?.publicUrl && (
          <a
            href={stats.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors px-4 py-2.5 rounded-xl text-sm"
          >
            <Eye className="h-4 w-4" /> View Public Menu
          </a>
        )}
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <DashboardCard
          title="Total Categories"
          value={stats?.totalCategories ?? 0}
          description="Menu categories"
          icon={Tag}
          color="orange"
          loading={loading}
        />
        <DashboardCard
          title="Total Menu Items"
          value={stats?.totalMenuItems ?? 0}
          description="Total dishes added"
          icon={UtensilsCrossed}
          color="blue"
          loading={loading}
        />
        <DashboardCard
          title="Available Items"
          value={stats?.availableItems ?? 0}
          description="Items in stock"
          icon={CheckCircle2}
          color="green"
          loading={loading}
        />
        <DashboardCard
          title="Out of Stock"
          value={stats?.outOfStockItems ?? 0}
          description="Items marked unavailable"
          icon={XCircle}
          color="pink"
          loading={loading}
        />
        <DashboardCard
          title="Total QR Scans"
          value={stats?.totalQrScans ?? 0}
          description="All-time scans"
          icon={ScanLine}
          color="purple"
          loading={loading}
        />
        <DashboardCard
          title="QR Downloads"
          value={stats?.qrDownloads ?? 0}
          description="All-time downloads"
          icon={QrCode}
          color="blue"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Action 1: Download QR */}
          <a
            href={stats?.qrCodeId ? `/api/qr/download?qrId=${stats.qrCodeId}&format=png` : "#"}
            className={`p-4 rounded-2xl border border-border bg-card/65 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer ${
              !stats?.qrCodeId ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
              <Download className="h-5 w-5" />
            </div>
            <p className="font-semibold text-xs">Download QR</p>
          </a>

          {/* Action 2: Print QR */}
          <button
            onClick={handlePrintQR}
            disabled={!stats?.qrCodeId}
            className="p-4 rounded-2xl border border-border bg-card/65 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer disabled:opacity-50"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
              <Printer className="h-5 w-5" />
            </div>
            <p className="font-semibold text-xs">Print QR</p>
          </button>

          {/* Action 3: Share Menu Link */}
          <button
            onClick={handleShareMenu}
            disabled={!stats?.publicUrl}
            className="p-4 rounded-2xl border border-border bg-card/65 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer disabled:opacity-50"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-3">
              <Share2 className="h-5 w-5" />
            </div>
            <p className="font-semibold text-xs">Share Menu</p>
          </button>

          {/* Action 4: Copy Public Menu URL */}
          <button
            onClick={handleCopyUrl}
            disabled={!stats?.publicUrl}
            className="p-4 rounded-2xl border border-border bg-card/65 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer disabled:opacity-50"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
              <Copy className="h-5 w-5" />
            </div>
            <p className="font-semibold text-xs">Copy URL</p>
          </button>

          {/* Action 5: Add Category */}
          <Link
            href="/categories"
            className="p-4 rounded-2xl border border-border bg-card/65 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-3">
              <Tag className="h-5 w-5" />
            </div>
            <p className="font-semibold text-xs">Add Category</p>
          </Link>

          {/* Action 6: Add Menu Item */}
          <Link
            href="/menu"
            className="p-4 rounded-2xl border border-border bg-card/65 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 mb-3">
              <Plus className="h-5 w-5" />
            </div>
            <p className="font-semibold text-xs">Add Menu Item</p>
          </Link>
        </div>
      </div>

      {/* Restaurant Overview & Live Stock Breakdown */}
      {stats?.hasRestaurant && stats.restaurantName && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Restaurant Profile</h2>
              <Link
                href="/restaurant"
                className="text-sm text-primary hover:underline font-medium"
              >
                Edit Profile
              </Link>
            </div>
            <p className="text-2xl font-extrabold gradient-text">
              {stats.restaurantName}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Slug: /menu/{stats.restaurantSlug}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                  stats.isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {stats.isActive ? "Menu Live & Online" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="text-lg font-bold mb-4">Live Menu Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Available Items
                </div>
                <span className="font-extrabold text-base text-emerald-700 dark:text-emerald-400">
                  {stats.availableItems}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center gap-2 text-sm font-medium text-rose-700 dark:text-rose-400">
                  <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" /> Out of Stock Items
                </div>
                <span className="font-extrabold text-base text-rose-700 dark:text-rose-400">
                  {stats.outOfStockItems}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
