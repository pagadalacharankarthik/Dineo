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
  Lock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import * as QRCodeLib from "qrcode";
import * as htmlToImage from "html-to-image";

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

const templatesConfig = [
  {
    id: "template1",
    name: "Classic Plaid Pizza Template",
    src: "/templates/template1.png",
    qr: { top: "40.5%", left: "29.5%", width: "41%", height: "29%" },
    text: { top: "14.5%", fontSize: 20, color: "#3e3e3e", fontStyle: "uppercase", bgHideColor: "#fdf8ec", hideWidth: "60%", hideHeight: "4%" }
  },
  {
    id: "template2",
    name: "Dark Gourmet Grill Template",
    src: "/templates/template2.png",
    qr: { top: "43.5%", left: "25.5%", width: "49%", height: "35%" },
    text: { top: "14.2%", fontSize: 24, color: "#f3f4f6", fontStyle: "capitalize", bgHideColor: "#1d1715", hideWidth: "70%", hideHeight: "5%" }
  },
  {
    id: "template3",
    name: "Rustic Pizza & Tomatoes Template",
    src: "/templates/template3.png",
    qr: { top: "37.5%", left: "25.8%", width: "48.4%", height: "34.5%" },
    text: { top: "12.8%", fontSize: 20, color: "#4f3521", fontStyle: "uppercase", bgHideColor: "#ffffff", hideWidth: "60%", hideHeight: "4%" }
  },
  {
    id: "template4",
    name: "Classic Steak House Template",
    src: "/templates/template4.png",
    qr: { top: "43.5%", left: "25.5%", width: "49%", height: "35%" },
    text: { top: "14.2%", fontSize: 24, color: "#f3f4f6", fontStyle: "capitalize", bgHideColor: "#1d1715", hideWidth: "70%", hideHeight: "5%" }
  },
  {
    id: "template5",
    name: "Premium Chef's Specials Template",
    src: "/templates/template5.png",
    qr: { top: "42%", left: "28.5%", width: "43%", height: "30.5%" },
    text: { top: "12.5%", fontSize: 22, color: "#473229", fontStyle: "uppercase", bgHideColor: "#ffffff", hideWidth: "70%", hideHeight: "5%" }
  }
];

export default function QRCodePage() {
  const [qrData, setQrData] = useState<QRDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [svgUrl, setSvgUrl] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<"orange" | "black" | "blue" | "purple" | "dark" | "emerald" | "rose" | "gold" | "red">("orange");
  const [isShaking, setIsShaking] = useState(false);
  const [posterFormat, setPosterFormat] = useState<"a4" | "a5" | "square">("a4");

  // Canva Templates State
  const [selectedTemplate, setSelectedTemplate] = useState<string>("template1");
  const [customName, setCustomName] = useState<string>("");
  const [customFontSize, setCustomFontSize] = useState<number>(22);
  const [customTextColor, setCustomTextColor] = useState<string>("");
  const [textTopOffset, setTextTopOffset] = useState<number>(0);
  const [textLeftOffset, setTextLeftOffset] = useState<number>(0);
  const [hidingWidthOffset, setHidingWidthOffset] = useState<number>(0);
  const [hidingHeightOffset, setHidingHeightOffset] = useState<number>(0);
  const [hidingOpacity, setHidingOpacity] = useState<number>(100);
  const [hidingColor, setHidingColor] = useState<string>("");
  const [downloadingTemplate, setDownloadingTemplate] = useState<boolean>(false);
  const templateRef = useRef<HTMLDivElement>(null);

  const colorOptions = {
    orange: { gradient: "from-orange-500 via-amber-500 to-amber-600", qr: "#ea580c" },
    black: { gradient: "from-zinc-800 via-neutral-900 to-black", qr: "#000000" },
    blue: { gradient: "from-blue-500 via-cyan-500 to-blue-600", qr: "#2563eb" },
    purple: { gradient: "from-purple-500 via-violet-500 to-purple-600", qr: "#7c3aed" },
    dark: { gradient: "from-slate-800 via-slate-900 to-black", qr: "#0f172a" },
    emerald: { gradient: "from-emerald-500 via-teal-500 to-emerald-600", qr: "#059669" },
    rose: { gradient: "from-rose-500 via-pink-500 to-rose-600", qr: "#e11d48" },
    gold: { gradient: "from-amber-400 via-yellow-500 to-amber-600", qr: "#d97706" },
    red: { gradient: "from-red-500 via-rose-600 to-red-650", qr: "#dc2626" },
  };

  const freeTierColors = ["orange", "black"];

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

  const generateQRCodes = async (details: QRDetails, activeColor: string = "orange") => {
    try {
      const { targetUrl, restaurantLogo, planName } = details;
      const isPro = planName === "PRO" || planName === "ENTERPRISE";
      const hasLogo = restaurantLogo && restaurantLogo.trim() !== "";

      // Ensure free tier can only use allowed colors
      const colorKey = (isPro || freeTierColors.includes(activeColor)) ? activeColor : "orange";
      const qrColor = colorOptions[colorKey as keyof typeof colorOptions].qr;
      
      // Pro gets their own logo if uploaded, otherwise everyone gets Dineo Menu logo
      const rawLogoUrl = (isPro && hasLogo) ? restaurantLogo! : "/logo.svg";
      const logoUrlToUse = new URL(rawLogoUrl, window.location.origin).href;

      // Fetch the logo and convert it to Base64 to ensure it embeds offline inside SVG downloads
      let base64LogoUrl = "";
      try {
        const logoRes = await fetch(logoUrlToUse);
        if (logoRes.ok) {
          const blob = await logoRes.blob();
          base64LogoUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {
        console.warn("Failed to fetch custom logo, trying fallback:", e);
      }

      if (!base64LogoUrl) {
        try {
          const fallbackRes = await fetch(new URL("/logo.svg", window.location.origin).href);
          if (fallbackRes.ok) {
            const blob = await fallbackRes.blob();
            base64LogoUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          }
        } catch (e) {
          console.error("Failed to load fallback Dineo Menu logo as base64:", e);
        }
      }

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
          dark: qrColor,
          light: "#FFFFFF",
        },
      });

      const ctx = canvas.getContext("2d");
      if (ctx && base64LogoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = base64LogoUrl;

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
            console.warn("Failed to load logo on canvas image loader");
            resolve();
          };
        });
      }

      const png = canvas.toDataURL("image/png");
      setDataUrl(png);

      // SVG fallback with logo injection
      let svg = await QRCodeLib.toString(targetUrl, {
        type: "svg",
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: qrColor,
          light: "#FFFFFF",
        },
      });

      // Inject logo into the center of the SVG
      if (base64LogoUrl) {
        const svgMatch = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
        if (svgMatch) {
          const size = parseFloat(svgMatch[1]);
          const logoSize = size * 0.25;
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;
          
          // White background block
          const injection = `
            <rect x="${x - 1}" y="${y - 1}" width="${logoSize + 2}" height="${logoSize + 2}" fill="#FFFFFF" rx="1" ry="1" />
            <image href="${base64LogoUrl}" x="${x}" y="${y}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid slice" />
          `;
          svg = svg.replace('</svg>', injection + '</svg>');
        }
      }

      const blob = new Blob([svg], { type: "image/svg+xml" });
      setSvgUrl(URL.createObjectURL(blob));

    } catch (err) {
      console.error("QR generation error:", err);
    }
  };

  useEffect(() => {
    fetchQR();
  }, []);

  useEffect(() => {
    if (qrData) {
      generateQRCodes(qrData, selectedColor);
    }
  }, [selectedColor]);

  useEffect(() => {
    if (qrData) {
      setCustomName(qrData.restaurantName);
      const currentTpl = templatesConfig.find(t => t.id === selectedTemplate);
      if (currentTpl) {
        setCustomTextColor(currentTpl.text.color);
        setCustomFontSize(currentTpl.text.fontSize);
        setTextTopOffset(0);
        setTextLeftOffset(0);
        setHidingWidthOffset(0);
        setHidingHeightOffset(0);
        setHidingOpacity(100);
        setHidingColor(currentTpl.text.bgHideColor);
      }
    }
  }, [qrData, selectedTemplate]);

  const handleCopyLink = () => {
    if (!qrData?.targetUrl) return;
    navigator.clipboard.writeText(qrData.targetUrl);
    setCopied(true);
    toast.success("Public menu link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = async () => {
    if (!printRef.current || !qrData) return;
    
    // Show a loading toast
    const toastId = toast.loading("Generating High-Res Poster...");
    
    try {
      // Small delay to ensure any dynamic rendering is settled
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const el = printRef.current;
      const image = await htmlToImage.toPng(el, {
        pixelRatio: 3, // Higher resolution
        width: el.offsetWidth,
        height: el.offsetHeight,
        style: {
          transform: 'none',
          margin: '0',
        },
        backgroundColor: "#ffffff", // Solid background to prevent transparency bugs
      });
      
      const link = document.createElement("a");
      link.href = image;
      link.download = `${qrData.restaurantSlug}-poster.png`;
      link.click();
      toast.success("Downloaded High-Res Poster!", { id: toastId });
    } catch (error: any) {
      console.error("Poster generation failed:", error);
      toast.error(`Failed to generate poster: ${error.message || "Unknown error"}`, { id: toastId });
    }
  };

  const handleDownloadSVG = () => {
    if (!svgUrl || !qrData) return;
    
    if (qrData.planName === "FREE_TRIAL") {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      toast.error("SVG Vector download is a Pro feature.", {
        action: {
          label: "Upgrade Now",
          onClick: () => {
            window.location.href = "/subscription";
          }
        }
      });
      return;
    }
    
    const link = document.createElement("a");
    link.href = svgUrl;
    link.download = `${qrData.restaurantSlug}-menu-qr.svg`;
    link.click();
    toast.success("Downloaded SVG Vector QR Code!");
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !qrData) return;
    const toastId = toast.loading("Generating High-Res PDF Poster...");
    try {
      const { jsPDF } = await import("jspdf");
      const el = printRef.current;
      
      // Capture the element bounding dimensions exactly
      const canvasImage = await htmlToImage.toPng(el, {
        pixelRatio: 3.5, // High resolution for print
        width: el.offsetWidth,
        height: el.offsetHeight,
        style: {
          transform: 'none',
          margin: '0',
        },
        backgroundColor: colorOptions[(qrData?.planName === "PRO" ? selectedColor : "orange") as keyof typeof colorOptions].qr,
      });
      
      const isSquare = posterFormat === "square";
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: isSquare ? [210, 210] : (posterFormat === "a5" ? "a5" : "a4"),
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Proportional scale to fit elements centered inside PDF margins
      const elRatio = el.offsetWidth / el.offsetHeight;
      
      // Calculate max layout sizing within A4/A5 or Square dimensions with a clean 10mm padding margin
      const margin = 10;
      const targetWidth = pageWidth - (margin * 2);
      const targetHeight = pageHeight - (margin * 2);
      
      let pdfImageWidth = targetWidth;
      let pdfImageHeight = targetWidth / elRatio;
      
      if (pdfImageHeight > targetHeight) {
        pdfImageHeight = targetHeight;
        pdfImageWidth = targetHeight * elRatio;
      }
      
      // Center the scaled elements
      const xOffset = (pageWidth - pdfImageWidth) / 2;
      const yOffset = (pageHeight - pdfImageHeight) / 2;
      
      doc.addImage(canvasImage, "PNG", xOffset, yOffset, pdfImageWidth, pdfImageHeight);
      doc.save(`${qrData.restaurantSlug}-qr-poster-${posterFormat}.pdf`);
      toast.success("Downloaded PDF Poster successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to generate PDF: ${err.message || "Unknown error"}`, { id: toastId });
    }
  };

  const handlePrint = async () => {
    if (!printRef.current || !qrData) return;
    const toastId = toast.loading("Preparing poster for print...");
    try {
      const el = printRef.current;
      
      // Capture the card as a high-resolution PNG
      const image = await htmlToImage.toPng(el, {
        pixelRatio: 3.5, // High resolution for sharp prints
        width: el.offsetWidth,
        height: el.offsetHeight,
        style: {
          transform: 'none',
          margin: '0',
        },
        backgroundColor: colorOptions[selectedTheme].qr,
      });

      // Create a temporary hidden iframe to handle printing cleanly
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const isSquare = posterFormat === "square";
      const pageAspectRatio = isSquare ? "1/1" : "1/1.414";

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.write(`
          <html>
            <head>
              <title>Print QR Poster</title>
              <style>
                @page {
                  margin: 0;
                  size: ${isSquare ? '210mm 210mm' : 'A4 portrait'};
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 100vw;
                  height: 100vh;
                  background-color: #ffffff;
                }
                img {
                  max-width: 90%;
                  max-height: 90%;
                  object-fit: contain;
                  aspect-ratio: ${pageAspectRatio};
                  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                  border-radius: 24px;
                }
              </style>
            </head>
            <body>
              <img src="${image}" onload="window.print();" />
            </body>
          </html>
        `);
        iframeDoc.close();

        // Remove iframe after print dialog is closed
        setTimeout(() => {
          document.body.removeChild(iframe);
          toast.success("Ready to print!", { id: toastId });
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Print preparation failed: ${err.message || "Unknown error"}`, { id: toastId });
    }
  };

  const handleDownloadTemplatePNG = async () => {
    if (!templateRef.current || !qrData) return;
    setDownloadingTemplate(true);
    const toastId = toast.loading("Generating customized Canva template PNG...");
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const el = templateRef.current;
      const dataUrlStr = await htmlToImage.toPng(el, {
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
      link.href = dataUrlStr;
      link.download = `${qrData.restaurantSlug}-${selectedTemplate}-poster.png`;
      link.click();
      toast.success("Downloaded customized Canva poster PNG!", { id: toastId });
    } catch (e: any) {
      console.error(e);
      toast.error(`Download failed: ${e.message || "Unknown error"}`, { id: toastId });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleDownloadTemplatePDF = async () => {
    if (!templateRef.current || !qrData) return;
    setDownloadingTemplate(true);
    const toastId = toast.loading("Generating customized Canva template PDF...");
    try {
      const { jsPDF } = await import("jspdf");
      await new Promise(resolve => setTimeout(resolve, 200));
      const el = templateRef.current;
      const dataUrlStr = await htmlToImage.toPng(el, {
        pixelRatio: 3,
        width: el.offsetWidth,
        height: el.offsetHeight,
        style: {
          transform: 'none',
          margin: '0',
        },
        backgroundColor: "#ffffff",
      });
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.addImage(dataUrlStr, "PNG", 0, 0, pageWidth, pageHeight);
      doc.save(`${qrData.restaurantSlug}-${selectedTemplate}-poster-a4.pdf`);
      toast.success("Downloaded customized Canva poster PDF!", { id: toastId });
    } catch (e: any) {
      console.error(e);
      toast.error(`Download failed: ${e.message || "Unknown error"}`, { id: toastId });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const isProOrEnterprise = qrData?.planName === "PRO" || qrData?.planName === "ENTERPRISE";
  const selectedTheme = (isProOrEnterprise || freeTierColors.includes(selectedColor)) ? selectedColor : "orange";

  return (
    <div className="space-y-8">
      {/* Printable Area styling */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake-btn {
          animation: shake 0.15s ease-in-out 0s 2;
        }
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 0;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-qr-poster,
          #printable-qr-poster * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-qr-poster {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            z-index: 99999 !important;
          }
          #printable-qr-poster > div#printable-qr-card {
            width: 85% !important;
            max-width: ${posterFormat === "square" ? "500px" : "450px"} !important;
            aspect-ratio: ${posterFormat === "square" ? "1/1" : "1/1.414"} !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            margin: auto !important;
            border-radius: 40px !important;
            padding: 40px !important;
            background-color: ${colorOptions[selectedTheme].qr} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Force text and badges to be legible white */
          #printable-qr-card h2,
          #printable-qr-card p {
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-qr-card div:not(.bg-white):not(.bg-white *) {
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Keep QR container white background and dark code */
          #printable-qr-card .bg-white,
          #printable-qr-card .bg-white * {
            background-color: #ffffff !important;
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
              className={`bg-zinc-50 dark:bg-zinc-900 border border-border rounded-3xl max-w-sm mx-auto flex items-center justify-center overflow-hidden ${
                posterFormat === "square" ? "p-4" : "p-8"
              }`}
              style={{ aspectRatio: posterFormat === "square" ? "1/1" : "1/1.414" }}
            >
              <div
                id="printable-qr-card"
                ref={printRef}
                className={`bg-gradient-to-br ${
                  colorOptions[selectedTheme].gradient
                } rounded-2xl text-white shadow-xl flex flex-col items-center justify-center w-full h-full text-center ${
                  posterFormat === "square" ? "p-5" : "p-8"
                }`}
              >
                <div className={`flex items-center gap-2 ${
                  posterFormat === "square" ? "mb-1" : "mb-2"
                }`}>
                  <Building2 className="h-6 w-6" />
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {qrData?.restaurantName}
                  </h2>
                </div>
                <p className={`text-xs text-white/90 font-medium ${
                  posterFormat === "square" ? "mb-3" : "mb-6"
                }`}>
                  Scan with any phone camera to view menu
                </p>

                <div className={`bg-white rounded-2xl shadow-2xl flex items-center justify-center aspect-square ${
                  posterFormat === "square" ? "w-[50%] p-2.5 mb-2.5" : "w-[55%] p-3.5 mb-4"
                }`}>
                  {dataUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={dataUrl}
                      alt="Restaurant QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-muted-foreground text-xs">
                      Generating...
                    </div>
                  )}
                </div>

                <div className={`bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/30 ${
                  posterFormat === "square" ? "py-1.5 px-3.5" : "py-2 px-4"
                }`}>
                  ⚡ Powered by Dineo Menu
                </div>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Print QR Poster
              </button>
              <button
                onClick={handleDownloadPNG}
                className="inline-flex items-center gap-2 bg-card border border-border hover:bg-muted font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download PNG
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 bg-card border border-border hover:bg-muted font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4 text-rose-500" /> Download PDF
              </button>
              <button
                onClick={handleDownloadSVG}
                className={`inline-flex items-center gap-2 bg-card border border-border hover:bg-muted font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${isShaking ? 'shake-btn border-red-500 text-red-500' : ''}`}
              >
                {qrData?.planName === "FREE_TRIAL" ? (
                  <><Lock className="h-4 w-4" /> SVG (Pro)</>
                ) : (
                  <><Download className="h-4 w-4" /> Download SVG</>
                )}
              </button>
            </div>

            {/* Poster Format Selector */}
            <div className="space-y-3 pt-4 border-t border-border/55 max-w-sm mx-auto text-left">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground justify-center sm:justify-start">
                <Layers className="h-4 w-4 text-primary" /> Poster Format Sizing
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "a4", label: "A4 Poster", desc: "210x297 mm" },
                  { value: "a5", label: "A5 Stand", desc: "148x210 mm" },
                  { value: "square", label: "Square Block", desc: "1:1 Aspect" }
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setPosterFormat(f.value as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      posterFormat === f.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p className="text-xs font-bold">{f.label}</p>
                    <p className="text-[9px] mt-0.5 opacity-80">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {qrData && (
              <div className="mt-6 space-y-3">
                <h3 className="font-bold text-sm flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Poster Color Customization
                </h3>
                <div className="flex items-center justify-center gap-3">
                  {(isProOrEnterprise
                    ? (Object.keys(colorOptions) as Array<keyof typeof colorOptions>)
                    : (freeTierColors as Array<keyof typeof colorOptions>)
                  ).map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color as "orange" | "black" | "blue" | "purple" | "dark")}
                      className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all ${
                        selectedColor === color ? "border-primary scale-110 ring-2 ring-primary/20" : "border-transparent hover:scale-105"
                      } bg-gradient-to-br ${colorOptions[color].gradient}`}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                    />
                  ))}
                </div>
              </div>
            )}

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

      {/* ─── Premium Canva Templates Section ─── */}
      {!loading && qrData && (
        <div className="border-t border-border/80 pt-8 mt-12 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 text-foreground">
              <Sparkles className="h-6 w-6 text-primary" /> Premium Canva Poster Templates
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Choose from 5 designer Canva templates. Customize your restaurant name, adjust font sizes, and download print-ready posters!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Template Preview Panel */}
            <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 flex flex-col items-center justify-center space-y-6 shadow-md">
              {/* The Poster Element container to capture */}
              <div className="border border-border/70 rounded-2xl shadow-xl overflow-hidden bg-white max-w-sm w-full relative">
                <div 
                  ref={templateRef}
                  className="relative w-full overflow-hidden select-none"
                  style={{ aspectRatio: "1/1.414" }} // Clean A4 aspect ratio preview
                >
                  {/* Background template image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={templatesConfig.find(t => t.id === selectedTemplate)?.src} 
                    alt="Canva Template Background"
                    className="w-full h-full object-cover"
                  />

                  {/* Hide Canva template name placeholder overlay block */}
                  {(() => {
                    const tpl = templatesConfig.find(t => t.id === selectedTemplate);
                    if (!tpl) return null;
                    
                    const baseWidth = parseFloat(tpl.text.hideWidth);
                    const baseHeight = parseFloat(tpl.text.hideHeight);
                    const baseTop = parseFloat(tpl.text.top);
                    
                    const computedWidth = `${baseWidth + hidingWidthOffset}%`;
                    const computedHeight = `${baseHeight + hidingHeightOffset}%`;
                    const computedLeft = `calc(50% + ${textLeftOffset}%)`;
                    const computedTop = `${baseTop + textTopOffset}%`;
                    
                    return (
                      <div 
                        className="absolute -translate-x-1/2"
                        style={{
                          left: computedLeft,
                          top: computedTop,
                          width: computedWidth,
                          height: computedHeight,
                          backgroundColor: hidingColor || tpl.text.bgHideColor,
                          opacity: hidingOpacity / 100,
                          zIndex: 10,
                        }}
                      />
                    );
                  })()}

                  {/* Dynamic Restaurant Name Text Overlay */}
                  {(() => {
                    const tpl = templatesConfig.find(t => t.id === selectedTemplate);
                    if (!tpl) return null;
                    
                    const baseTop = parseFloat(tpl.text.top);
                    const computedTop = `${baseTop + textTopOffset}%`;
                    const computedLeft = `calc(50% + ${textLeftOffset}%)`;
                    
                    return (
                      <div 
                        className="absolute -translate-x-1/2 text-center font-bold flex items-center justify-center w-[85%] select-text"
                        style={{
                          left: computedLeft,
                          top: computedTop,
                          fontSize: `${customFontSize}px`,
                          color: customTextColor || tpl.text.color,
                          textTransform: tpl.text.fontStyle as any,
                          fontFamily: "var(--font-sans), sans-serif",
                          zIndex: 20,
                          lineHeight: 1.1,
                        }}
                      >
                        {customName || qrData?.restaurantName}
                      </div>
                    );
                  })()}

                  {/* Overlaid QR Code in Canva Placement Box */}
                  {(() => {
                    const tpl = templatesConfig.find(t => t.id === selectedTemplate);
                    if (!tpl) return null;
                    return (
                      <div 
                        className="absolute bg-white flex items-center justify-center p-1.5 shadow-sm rounded-lg"
                        style={{
                          top: tpl.qr.top,
                          left: tpl.qr.left,
                          width: tpl.qr.width,
                          height: tpl.qr.height,
                          zIndex: 20,
                        }}
                      >
                        {dataUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img 
                            src={dataUrl} 
                            alt="QR Code" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-[8px] text-muted-foreground">QR Code</div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Template select grid */}
              <div className="w-full space-y-3">
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider text-center lg:text-left">
                  Select Template layout:
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {templatesConfig.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`aspect-[1/1.414] rounded-xl border relative overflow-hidden transition-all duration-200 cursor-pointer ${
                        selectedTemplate === tpl.id 
                          ? "border-primary ring-2 ring-primary/20 scale-105" 
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={tpl.src} 
                        alt={tpl.name} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Editor Controls Panel */}
            <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 space-y-6 shadow-md">
              <h3 className="font-bold text-base flex items-center gap-2 border-b border-border pb-3">
                <Layers className="h-5 w-5 text-primary" /> Template Customizations
              </h3>

              {/* Restaurant Name Control */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                  Restaurant Name Text
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter Restaurant Name"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Font Size Adjuster Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold uppercase text-muted-foreground">
                  <span>Font Size</span>
                  <span className="text-primary font-mono">{customFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="0.5"
                  value={customFontSize}
                  onChange={(e) => setCustomFontSize(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Vertical Alignment Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold uppercase text-muted-foreground">
                  <span>Vertical Position Offset</span>
                  <span className="text-primary font-mono">{textTopOffset > 0 ? `+${textTopOffset}` : textTopOffset}%</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="0.1"
                  value={textTopOffset}
                  onChange={(e) => setTextTopOffset(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Horizontal Alignment Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold uppercase text-muted-foreground">
                  <span>Horizontal Position Offset</span>
                  <span className="text-primary font-mono">{textLeftOffset > 0 ? `+${textLeftOffset}` : textLeftOffset}%</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  step="0.1"
                  value={textLeftOffset}
                  onChange={(e) => setTextLeftOffset(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Hiding Block custom styling controls */}
              <div className="pt-4 border-t border-border space-y-4">
                <h4 className="text-xs font-extrabold uppercase text-foreground tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-primary rounded-full inline-block" />
                  Background Hiding Box Adjuster
                </h4>

                {/* Hiding Block Opacity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-extrabold uppercase text-muted-foreground">
                    <span>Hiding Box Opacity</span>
                    <span className="text-primary font-mono">{hidingOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={hidingOpacity}
                    onChange={(e) => setHidingOpacity(parseInt(e.target.value, 10))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Hiding Block Width */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-extrabold uppercase text-muted-foreground">
                    <span>Hiding Box Width</span>
                    <span className="text-primary font-mono">{hidingWidthOffset >= 0 ? `+${hidingWidthOffset}` : hidingWidthOffset}%</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="0.5"
                    value={hidingWidthOffset}
                    onChange={(e) => setHidingWidthOffset(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Hiding Block Height */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-extrabold uppercase text-muted-foreground">
                    <span>Hiding Box Height</span>
                    <span className="text-primary font-mono">{hidingHeightOffset >= 0 ? `+${hidingHeightOffset}` : hidingHeightOffset}%</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={hidingHeightOffset}
                    onChange={(e) => setHidingHeightOffset(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Hiding Block Color */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                    Hiding Box Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hidingColor || "#ffffff"}
                      onChange={(e) => setHidingColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={hidingColor}
                      onChange={(e) => setHidingColor(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const currentTpl = templatesConfig.find(t => t.id === selectedTemplate);
                        if (currentTpl) {
                          setHidingColor(currentTpl.text.bgHideColor);
                        }
                      }}
                      className="text-[10px] font-bold bg-muted hover:bg-muted/80 px-2 py-1.5 rounded-lg border border-border transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Color Picker Control */}
              <div className="space-y-2.5">
                <label className="block text-xs font-extrabold uppercase text-muted-foreground">
                  Text Color Theme
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { value: "#3e3e3e", label: "Charcoal" },
                    { value: "#ffffff", label: "White" },
                    { value: "#4f3521", label: "Wood Brown" },
                    { value: "#ea580c", label: "Dineo Orange" },
                    { value: "#dc2626", label: "Rose Crimson" },
                    { value: "#14532d", label: "Forest Green" }
                  ].map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCustomTextColor(c.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        (customTextColor || templatesConfig.find(t => t.id === selectedTemplate)?.text.color) === c.value
                          ? "border-primary bg-primary/5 text-primary scale-105"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shrink-0" 
                        style={{ backgroundColor: c.value }} 
                      />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Download Buttons */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
                <button
                  disabled={downloadingTemplate}
                  onClick={handleDownloadTemplatePNG}
                  className="flex-1 inline-flex items-center justify-center gap-2 gradient-primary text-white font-semibold px-5 py-3 rounded-xl text-sm shadow-md hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingTemplate ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download Poster PNG
                </button>
                <button
                  disabled={downloadingTemplate}
                  onClick={handleDownloadTemplatePDF}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-card border border-border hover:bg-muted font-semibold px-5 py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingTemplate ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 text-rose-500" />
                  )}
                  Download Poster PDF (A4)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
