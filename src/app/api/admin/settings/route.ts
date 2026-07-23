import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { guestBannerActive, guestBannerText, merchantBannerActive, merchantBannerText } = await req.json();

    const settings = await db.globalSettings.upsert({
      where: { id: "singleton" },
      update: {
        guestBannerActive: guestBannerActive !== undefined ? guestBannerActive : undefined,
        guestBannerText: guestBannerText !== undefined ? guestBannerText : undefined,
        merchantBannerActive: merchantBannerActive !== undefined ? merchantBannerActive : undefined,
        merchantBannerText: merchantBannerText !== undefined ? merchantBannerText : undefined,
      },
      create: {
        id: "singleton",
        guestBannerActive: guestBannerActive !== undefined ? guestBannerActive : true,
        guestBannerText: guestBannerText !== undefined ? guestBannerText : "🎉 Special Launch Offer: Get 20% off physical NFC standee kits. Register your restaurant now!",
        merchantBannerActive: merchantBannerActive !== undefined ? merchantBannerActive : true,
        merchantBannerText: merchantBannerText !== undefined ? merchantBannerText : "🎉 Exclusive Offer: Get 20% Off your first order of physical NFC Table Standees! Request your kit today.",
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("POST /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update global settings" },
      { status: 500 }
    );
  }
}
