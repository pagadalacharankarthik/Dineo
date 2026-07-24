"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import * as QRCodeLib from "qrcode";
import * as htmlToImage from "html-to-image";
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
  FileText,
  Loader2,
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
  offerBannerText?: string;
  restaurantLogo?: string | null;
  planName?: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingMenuPDF, setDownloadingMenuPDF] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
          if (data.data.qrCodeId) {
            generateQRCodes(data.data);
          }
        }
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

  const generateQRCodes = async (details: any) => {
    try {
      const { publicUrl, restaurantLogo, planName } = details;
      const isPro = planName === "PRO";
      const hasLogo = restaurantLogo && restaurantLogo.trim() !== "";
      
      const qrColor = "#ea580c"; // Default Orange
      
      // Pro gets their own logo if uploaded, otherwise everyone gets Dineo logo
      const rawLogoUrl = (isPro && hasLogo) ? restaurantLogo! : "/logo.svg";
      const logoUrlToUse = new URL(rawLogoUrl, window.location.origin).href;

      const canvas = document.createElement("canvas");
      const canvasSize = 1024;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      await QRCodeLib.toCanvas(canvas, publicUrl, {
        width: canvasSize,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: qrColor,
          light: "#FFFFFF",
        },
      });

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = logoUrlToUse;

        await new Promise<void>((resolve) => {
          logoImg.onload = () => {
            const logoSize = canvasSize * 0.22;
            const x = (canvasSize - logoSize) / 2;
            const y = (canvasSize - logoSize) / 2;

            // Draw white border box
            ctx.fillStyle = "#FFFFFF";
            const radius = logoSize * 0.2;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + logoSize - radius, y);
            ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + radius);
            ctx.lineTo(x + logoSize, y + logoSize - radius);
            ctx.quadraticCurveTo(x + logoSize, y + logoSize, x + logoSize - radius, y + logoSize);
            ctx.lineTo(x + radius, y + logoSize);
            ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();

            // Border stroke
            ctx.lineWidth = 6;
            ctx.strokeStyle = "#F1F5F9";
            ctx.stroke();

            // Draw logo inside
            const margin = logoSize * 0.12;
            const size = logoSize - (margin * 2);
            ctx.drawImage(logoImg, x + margin, y + margin, size, size);
            resolve();
          };

          logoImg.onerror = () => {
            console.warn("Failed to load custom logo, falling back to default Dineo logo");
            const defaultLogo = new URL("/logo.svg", window.location.origin).href;
            if (logoImg.src !== defaultLogo) {
              logoImg.src = defaultLogo;
            } else {
              resolve();
            }
          };
        });
      }

      const png = canvas.toDataURL("image/png");
      setDataUrl(png);
    } catch (err) {
      console.error("QR generation error:", err);
    }
  };

  const handleDownloadQR = async () => {
    if (!printRef.current || !stats) return;
    const toastId = toast.loading("Generating your high-res QR Poster...");
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const el = printRef.current;
      const image = await htmlToImage.toPng(el, {
        pixelRatio: 3,
        width: el.offsetWidth,
        height: el.offsetHeight,
        style: {
          transform: 'none',
          margin: '0',
        },
        backgroundColor: "#ffffff",
      });
      
      const link = document.createElement("a");
      link.href = image;
      link.download = `${stats.restaurantSlug}-poster.png`;
      link.click();
      toast.success("Downloaded High-Res Poster!", { id: toastId });
    } catch (error: any) {
      console.error("Poster generation failed:", error);
      toast.error(`Failed to generate poster: ${error.message || "Unknown error"}`, { id: toastId });
    }
  };

  const handlePrintQR = () => {
    if (!stats?.qrCodeId) {
      toast.error("QR Code not ready yet. Please setup your restaurant details.");
      return;
    }
    window.print();
  };

  const stripEmojis = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '')
      .replace(/[^\x00-\x7F]/g, "")
      .trim();
  };

  const handleDownloadMenuPDF = async () => {
    if (!stats?.restaurantSlug) return;
    setDownloadingMenuPDF(true);
    const toastId = toast.loading("Generating your formatted menu PDF...");
    try {
      // 1. Fetch live menu data
      const res = await fetch(`/api/public/menu/${stats.restaurantSlug}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch menu details");
      }
      const restaurant = data.data;

      // 2. Import jsPDF dynamically
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // 3. Fetch restaurant logo in base64 format for jsPDF embedding
      let logoData = null;
      const logoUrl = restaurant.logo;
      if (logoUrl && logoUrl.trim() !== "") {
        try {
          const absoluteLogoUrl = logoUrl.startsWith("http")
            ? logoUrl
            : `${window.location.origin}${logoUrl}`;
          const logoRes = await fetch(absoluteLogoUrl);
          if (logoRes.ok) {
            const buffer = await logoRes.arrayBuffer();
            const base64 = btoa(
              new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
            );
            const contentType = logoRes.headers.get("content-type") || "image/png";
            let format: "PNG" | "JPEG" = "PNG";
            if (contentType.includes("jpeg") || contentType.includes("jpg")) {
              format = "JPEG";
            }
            logoData = { data: `data:${contentType};base64,${base64}`, format };
          }
        } catch (e) {
          console.warn("Failed to retrieve custom logo for PDF menu, using fallback:", e);
        }
      }

      // If custom logo failed or doesn't exist, try loading default Dineo logo-light
      if (!logoData) {
        try {
          const fallbackRes = await fetch(`${window.location.origin}/logo-light.png`);
          if (fallbackRes.ok) {
            const buffer = await fallbackRes.arrayBuffer();
            const base64 = btoa(
              new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
            );
            logoData = { data: `data:image/png;base64,${base64}`, format: "PNG" as const };
          }
        } catch (e) {
          console.error("Failed to load default Dineo logo for menu:", e);
        }
      }

      // 4. Draw Header Branding (Clean white header with top primary accent line)
      doc.setFillColor(249, 115, 22); // Orange-500
      doc.rect(0, 0, 210, 4, "F");

      // Draw Logo
      let textXOffset = 14;
      if (logoData && logoData.data) {
        doc.addImage(logoData.data, logoData.format, 14, 10, 20, 20);
        textXOffset = 38;
      }

      // Restaurant Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text(stripEmojis(restaurant.name), textXOffset, 18);

      // Restaurant Description / Tagline
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate-500
      const descText = restaurant.description
        ? restaurant.description.substring(0, 85)
        : (restaurant.address || "Smart Digital QR Menu");
      doc.text(stripEmojis(descText), textXOffset, 24);

      // Business Contact Info Line
      const contactText = `${restaurant.mobile || ""} | ${restaurant.email || ""} | /menu/${restaurant.slug}`;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(249, 115, 22); // Orange-500
      doc.text(stripEmojis(contactText), textXOffset, 29);

      // Horizontal separator line
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.5);
      doc.line(14, 35, 196, 35);

      // 5. Draw Categories and Menu Items
      let y = 46;
      restaurant.categories.forEach((cat: any) => {
        if (!cat.menuItems || cat.menuItems.length === 0) return;

        // Check page overflow
        if (y > 250) {
          doc.addPage();
          // Draw top orange accent line on new page
          doc.setFillColor(249, 115, 22);
          doc.rect(0, 0, 210, 4, "F");
          y = 20;
        }

        // Category Name Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(249, 115, 22); // Orange-500
        doc.text(stripEmojis(cat.name), 14, y);
        doc.setDrawColor(254, 215, 170); // Orange-200 (faint line)
        doc.line(14, y + 2, 196, y + 2);

        y += 10;

        cat.menuItems.forEach((item: any) => {
          if (!item.isAvailable) return;

          // Check page overflow (Item Name + Price + Description spacing)
          const neededSpace = item.description ? 15 : 9;
          if (y + neededSpace > 275) {
            doc.addPage();
            doc.setFillColor(249, 115, 22);
            doc.rect(0, 0, 210, 4, "F");
            y = 20;
          }

          // Item Name
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(30, 41, 59); // Slate-800
          const vegTag = item.isVeg ? "[Veg]" : "[Non-Veg]";
          doc.text(`${vegTag} ${stripEmojis(item.name)}`, 14, y);

          // Price Align Right
          const activePrice = item.discountPrice !== null && item.discountPrice !== undefined
            ? `Rs. ${item.discountPrice.toFixed(2)}`
            : `Rs. ${item.price.toFixed(2)}`;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(15, 23, 42); // Slate-900
          doc.text(activePrice, 196 - doc.getTextWidth(activePrice), y);

          // Description (if present)
          if (item.description) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(100, 116, 139); // Slate-500
            doc.text(stripEmojis(item.description.substring(0, 95)), 14, y + 4.5);
            y += 11;
          } else {
            y += 8;
          }
        });

        y += 6; // Extra space after category block
      });

      // Footer branding on last page
      doc.setFillColor(248, 250, 252); // Zinc-50
      doc.rect(0, 282, 210, 15, "F");
      doc.setDrawColor(241, 245, 249); // Zinc-100
      doc.line(0, 282, 210, 282);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text("Generated by Dineo - Beautiful Digital Menus & QR Table Standees", 105, 290, { align: "center" });

      // Save PDF document
      doc.save(`${restaurant.slug}-menu.pdf`);
      toast.success("Branded Menu PDF downloaded successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Failed to generate PDF menu:", error);
      toast.error(error.message || "Failed to download menu PDF", { id: toastId });
    } finally {
      setDownloadingMenuPDF(false);
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
            <p>{stats.offerBannerText}</p>
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
          <button
            onClick={handleDownloadQR}
            disabled={!stats?.qrCodeId || !dataUrl}
            className="p-4 rounded-2xl border border-border bg-card/65 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer disabled:opacity-50"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
              <Download className="h-5 w-5" />
            </div>
            <p className="font-semibold text-xs">Download QR</p>
          </button>

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

          {/* Action 5: Download PDF Menu */}
          <button
            onClick={handleDownloadMenuPDF}
            disabled={downloadingMenuPDF || !stats?.restaurantSlug}
            className="p-4 rounded-2xl border border-border bg-card/65 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer disabled:opacity-50"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-3">
              {downloadingMenuPDF ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>
            <p className="font-semibold text-xs">Download PDF Menu</p>
          </button>

          {/* Action 6: Add Category */}
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

      {/* Hidden Print/Download Poster Component */}
      {stats?.restaurantName && (
        <>
          <style jsx global>{`
            @media print {
              @page {
                margin: 0;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-qr-poster,
              #printable-qr-poster * {
                visibility: visible !important;
              }
              #printable-qr-poster {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: #ffffff !important;
                margin: 0 !important;
                padding: 10% !important;
                box-sizing: border-box !important;
                z-index: 99999 !important;
              }
              #printable-qr-poster > div {
                width: 80% !important;
                height: 80% !important;
                max-width: 450px !important;
                max-height: 600px !important;
                border-radius: 40px !important;
                padding: 40px !important;
              }
            }
          `}</style>
          
          <div className="absolute -left-[9999px] -top-[9999px]">
            <div
              id="printable-qr-poster"
              ref={printRef}
              className="bg-white flex items-center justify-center p-12 overflow-hidden"
              style={{ width: "384px", height: "512px" }}
            >
              <div
                className="bg-gradient-to-br from-orange-500 via-amber-500 to-amber-600 p-8 rounded-3xl text-white shadow-xl flex flex-col items-center justify-center w-full h-full text-center"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-6 w-6" />
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {stats.restaurantName}
                  </h2>
                </div>
                <p className="text-xs text-white/90 font-medium mb-6">
                  Scan with any phone camera to view menu
                </p>

                <div className="bg-white p-4 rounded-2xl shadow-2xl mb-4">
                  {dataUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={dataUrl}
                      alt="Restaurant QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-muted-foreground">
                      Generating...
                    </div>
                  )}
                </div>

                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/30">
                  ⚡ Powered by Dineo
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
