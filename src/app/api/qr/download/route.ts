import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as QRCodeLib from "qrcode";
import { jsPDF } from "jspdf";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "png";
    const qrId = searchParams.get("qrId");

    if (!qrId) {
      return NextResponse.json({ success: false, error: "QR Code ID is required" }, { status: 400 });
    }

    const qrCode = await db.qRCode.findUnique({
      where: { id: qrId },
      include: { restaurant: true },
    });

    if (!qrCode) {
      return NextResponse.json({ success: false, error: "QR Code not found" }, { status: 404 });
    }

    // Increment downloads count
    await db.qRCode.update({
      where: { id: qrCode.id },
      data: { downloadsCount: { increment: 1 } },
    });

    const targetUrl = qrCode.targetUrl;
    const filename = `dineo-qr-${qrCode.restaurant.slug}.${format}`;

    if (format === "svg") {
      const svgString = await QRCodeLib.toString(targetUrl, {
        type: "svg",
        margin: 2,
        width: 512,
      });

      return new Response(svgString, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === "pdf") {
      // High-resolution PNG to embed in PDF
      const pngDataUrl = await QRCodeLib.toDataURL(targetUrl, {
        margin: 2,
        width: 1024,
      });

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Top banner
      doc.setFillColor(249, 115, 22); // Orange-500
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text(qrCode.restaurant.name.toUpperCase(), 105, 22, { align: "center" });

      doc.setTextColor(71, 85, 105); // Slate-600
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text("Scan QR Code to View our Digital Menu", 105, 55, { align: "center" });

      // Embed QR image
      doc.addImage(pngDataUrl, "PNG", 45, 75, 120, 120);

      // Bottom banner info
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(0, 262, 210, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("Powered by Dineo - Scan, Order, Enjoy!", 105, 280, { align: "center" });

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

      return new Response(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Default: PNG
    const pngBuffer = await QRCodeLib.toBuffer(targetUrl, {
      margin: 2,
      width: 1024,
    });

    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/qr/download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download QR code" },
      { status: 500 }
    );
  }
}
