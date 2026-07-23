import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { restaurantSchema } from "@/lib/validations/restaurant";

export async function GET() {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const settings = await db.globalSettings.findUnique({
      where: { id: "singleton" },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...restaurant,
        showTrialBanner: restaurant!.planName === "FREE_TRIAL" ? restaurant!.showTrialBanner : false,
        showOfferBanner: restaurant!.planName === "FREE_TRIAL" ? (settings?.merchantBannerActive ?? true) : false,
        offerBannerText: settings?.merchantBannerText ?? "🎉 Exclusive Offer: Get 20% Off your first order of physical NFC Table Standees! Request your kit today.",
      },
    });
  } catch (error) {
    console.error("GET /api/restaurant error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch restaurant details" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const validatedData = restaurantSchema.parse(body);

    const targetSlug = validatedData.slug && validatedData.slug.trim() !== ""
      ? validatedData.slug.trim().toLowerCase()
      : restaurant!.slug;

    // Check if new slug is taken by another restaurant
    if (targetSlug !== restaurant!.slug) {
      const existing = await db.restaurant.findUnique({
        where: { slug: targetSlug },
      });
      if (existing && existing.id !== restaurant!.id) {
        return NextResponse.json(
          { success: false, error: "Slug is already in use by another restaurant" },
          { status: 400 }
        );
      }
    }

    const updated = await db.restaurant.update({
      where: { id: restaurant!.id },
      data: {
        ...validatedData,
        slug: targetSlug,
      },
    });

    // Update main QR code targetUrl if slug changed
    if (targetSlug !== restaurant!.slug) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await db.qRCode.updateMany({
        where: { restaurantId: restaurant!.id, qrType: "RESTAURANT_MAIN" },
        data: {
          code: `qr-${targetSlug}`,
          targetUrl: `${baseUrl}/menu/${targetSlug}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/restaurant error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update restaurant details" },
      { status: 400 }
    );
  }
}
