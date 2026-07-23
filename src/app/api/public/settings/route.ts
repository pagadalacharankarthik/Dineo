import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = await db.globalSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      settings = await db.globalSettings.create({
        data: {
          id: "singleton",
          guestBannerActive: true,
          guestBannerText: "🎉 Special Launch Offer: Get 20% off physical NFC standee kits. Register your restaurant now!",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("GET /api/public/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch global settings" },
      { status: 500 }
    );
  }
}
