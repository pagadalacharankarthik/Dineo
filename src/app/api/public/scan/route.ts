import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";

function parseUserAgent(uaString: string) {
  let browser = "Unknown";
  let os = "Unknown";
  let deviceType = "Desktop";

  if (!uaString) return { browser, os, deviceType };

  const ua = uaString.toLowerCase();

  // Parse OS
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) os = "iOS";
  else if (ua.includes("macintosh") || ua.includes("mac os")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";

  // Parse Browser
  if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("chrome") && !ua.includes("chromium")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("edge")) browser = "Edge";
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";

  // Parse Device Type
  if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone")) {
    deviceType = "Mobile";
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    deviceType = "Tablet";
  }

  return { browser, os, deviceType };
}

export async function POST(req: Request) {
  try {
    const { slug, referrer, visitorId } = await req.json();

    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug is required" }, { status: 400 });
    }

    // Find the restaurant and its main QR code
    const restaurant = await db.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        qrCodes: {
          where: { qrType: "RESTAURANT_MAIN" },
          take: 1,
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    const qrCode = restaurant.qrCodes[0];
    if (!qrCode) {
      return NextResponse.json({ success: false, error: "QR code not found" }, { status: 404 });
    }

    // Extract headers
    const reqHeaders = await headers();
    const userAgent = reqHeaders.get("user-agent") || "";
    const country = reqHeaders.get("x-vercel-ip-country") || reqHeaders.get("cf-ipcountry") || "Unknown";
    const city = reqHeaders.get("x-vercel-ip-city") || "Unknown";

    const { browser, os, deviceType } = parseUserAgent(userAgent);

    // Save scan record
    const scan = await db.qRScan.create({
      data: {
        qrCodeId: qrCode.id,
        restaurantId: restaurant.id,
        deviceType,
        browser,
        os,
        city: city !== "Unknown" ? city : null,
        country: country !== "Unknown" ? country : null,
        referrer: referrer || null,
        visitorId: visitorId || null,
      },
    });

    // Increment scans count on QR Code
    await db.qRCode.update({
      where: { id: qrCode.id },
      data: { scansCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: { id: scan.id },
    });
  } catch (error) {
    console.error("POST /api/public/scan error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record scan analytics" },
      { status: 500 }
    );
  }
}
