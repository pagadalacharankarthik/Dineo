"use client";

import { useEffect, useState, useRef } from "react";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  ExternalLink,
  Check,
  ScanLine,
  Building2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import * as QRCodeLib from "qrcode";

interface QRDetails {
  id: string;
  code: string;
  targetUrl: string;
  scansCount: number;
  restaurantName: string;
  restaurantSlug: string;
  restaurantLogo?: string | null;
  planName?: string;
}

export default function QRCodePage() {
  const [qrData, setQrData] = useState<QRDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [svgUrl, setSvgUrl] = useState<string>("");

  const printRef = useRef<HTMLDivElement>(null);

  const fetchQR = async () => {
    try {
      const res = await fetch("/api/qr");
      const data = await res.json();
      if (data.success) {
        setQrData(data.data);
        generateQRCodes(data.data);
      }
    } catch {
      toast.error("Failed to load QR details");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodes = async (details: QRDetails) => {
    try {
      const { targetUrl, restaurantLogo, planName } = details;
      const isPro = planName === "PRO";
      const hasLogo = restaurantLogo && restaurantLogo.trim() !== "";

      // Embed logo for PRO plan users on Canvas
      if (isPro && hasLogo) {
        const canvas = document.createElement("canvas");
        const canvasSize = 1024;
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        // Use High Error Correction Level 'H' to ensure QR is readable with central logo overlay
        await QRCodeLib.toCanvas(canvas, targetUrl, {
          width: canvasSize,
          margin: 2,
          errorCorrectionLevel: "H",
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        const ctx = canvas.getContext("2d");
        if (ctx) {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.src = restaurantLogo!;

          await new Promise<void>((resolve) => {
            logoImg.onload = () => {
              // Logo size is 22% of QR size for safety
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
              console.warn("Failed to load restaurant logo, generating fallback plain QR code");
              resolve();
            };
          });
        }

        const png = canvas.toDataURL("image/png");
        setDataUrl(png);

        // SVG fallback
        const svg = await QRCodeLib.toString(targetUrl, {
          type: "svg",
          margin: 2,
          errorCorrectionLevel: "H",
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        const blob = new Blob([svg], { type: "image/svg+xml" });
        setSvgUrl(URL.createObjectURL(blob));
      } else {
        // Standard code generation
        const png = await QRCodeLib.toDataURL(targetUrl, {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: "M",
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setDataUrl(png);

        const svg = await QRCodeLib.toString(targetUrl, {
          type: "svg",
          margin: 2,
          errorCorrectionLevel: "M",
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        const blob = new Blob([svg], { type: "image/svg+xml" });
        setSvgUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error("QR generation error:", err);
    }
  };

  useEffect(() => {
    fetchQR();
  }, []);

  const handleCopyLink = () => {
    if (!qrData?.targetUrl) return;
    navigator.clipboard.writeText(qrData.targetUrl);
    setCopied(true);
    toast.success("Public menu link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!dataUrl || !qrData) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${qrData.restaurantSlug}-menu-qr.png`;
    link.click();
    toast.success("Downloaded High-Res PNG QR Code!");
  };

  const handleDownloadSVG = () => {
    if (!svgUrl || !qrData) return;
    const link = document.createElement("a");
    link.href = svgUrl;
    link.download = `${qrData.restaurantSlug}-menu-qr.svg`;
    link.click();
    toast.success("Downloaded SVG Vector QR Code!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Printable Area styling */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-qr-poster,
          #printable-qr-poster * {
            visibility: visible;
          }
          #printable-qr-poster {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 40px;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
          <QrCode className="h-7 w-7 text-primary" /> Permanent QR Code System
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your restaurant has one permanent QR code. Print it once — menu updates reflect instantly without reprinting!
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Generating QR code...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main QR Display Poster Card */}
          <div className="lg:col-span-6 bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-lg relative overflow-hidden">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full px-3.5 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Permanent QR · Never Expires
            </div>

            {/* Poster Preview */}
            <div
              id="printable-qr-poster"
              ref={printRef}
              className="bg-gradient-to-br from-orange-500 via-amber-500 to-amber-600 p-8 rounded-3xl text-white shadow-xl max-w-sm mx-auto flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-6 w-6" />
                <h2 className="text-2xl font-extrabold tracking-tight">
                  {qrData?.restaurantName}
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
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-muted-foreground">
                    Generating...
                  </div>
                )}
              </div>

              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase border border-white/30">
                ⚡ Powered by Dineo
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md hover:opacity-90 transition-opacity"
              >
                <Printer className="h-4 w-4" /> Print QR Poster
              </button>
              <button
                onClick={handleDownloadPNG}
                className="inline-flex items-center gap-2 bg-card border border-border hover:bg-muted font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Download className="h-4 w-4" /> Download PNG
              </button>
              <button
                onClick={handleDownloadSVG}
                className="inline-flex items-center gap-2 bg-card border border-border hover:bg-muted font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Download className="h-4 w-4" /> Download SVG
              </button>
            </div>

            {qrData?.planName === "FREE_TRIAL" && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <Sparkles className="h-4 w-4" /> Professional Tier Feature
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Embed your restaurant's logo in the center of your menu QR codes for a custom, branded look! Upgrade your plan to Professional to unlock.
                </p>
              </div>
            )}
            
            {qrData?.planName === "PRO" && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <Check className="h-4 w-4" /> Custom Branding Enabled
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your custom logo is successfully embedded in the center of the QR code. You can update your logo under the Restaurant Profile settings page.
                </p>
              </div>
            )}
          </div>

          {/* Right Info & Public URL Card */}
          <div className="lg:col-span-6 space-y-6">
            {/* Public Link Card */}
            <div className="p-6 rounded-3xl border border-border bg-card space-y-4">
              <h3 className="font-bold text-lg">Public Menu URL</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is your restaurant&apos;s unique digital menu address. Point your printed QR codes or social media bio to this link.
              </p>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/40">
                <input
                  type="text"
                  readOnly
                  value={qrData?.targetUrl || ""}
                  className="flex-1 bg-transparent text-xs font-mono font-semibold outline-hidden px-2 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 bg-background border border-border hover:bg-muted text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </button>
                {qrData?.targetUrl && (
                  <a
                    href={qrData.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 gradient-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </a>
                )}
              </div>
            </div>

            {/* Scan Analytics Card */}
            <div className="p-6 rounded-3xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ScanLine className="h-5 w-5 text-purple-600" /> Total Menu Scans
                </h3>
                <span className="text-2xl font-extrabold gradient-text">
                  {qrData?.scansCount ?? 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Every customer visit via your QR code increments this metric in real-time.
              </p>
            </div>

            {/* Key QR Guidelines */}
            <div className="p-6 rounded-3xl border border-border bg-muted/30 space-y-3">
              <h3 className="font-bold text-sm">💡 Quick Tips for QR Printing</h3>
              <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside leading-relaxed">
                <li>Place QR standees on every table, at reception, and near entry doors.</li>
                <li>Ensure high contrast when printing (dark QR on light background).</li>
                <li>Updates to prices or items happen instantly — no reprinting needed!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
