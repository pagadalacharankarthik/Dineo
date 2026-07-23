import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const targetUrl = `${baseUrl}/menu/${restaurant!.slug}`;

    let qrCode = await db.qRCode.findFirst({
      where: { restaurantId: restaurant!.id, qrType: "RESTAURANT_MAIN" },
    });

    if (!qrCode) {
      qrCode = await db.qRCode.create({
        data: {
          restaurantId: restaurant!.id,
          code: `qr-${restaurant!.slug}`,
          targetUrl,
          qrType: "RESTAURANT_MAIN",
        },
      });
    } else if (qrCode.targetUrl !== targetUrl) {
      qrCode = await db.qRCode.update({
        where: { id: qrCode.id },
        data: { targetUrl },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...qrCode,
        restaurantName: restaurant!.name,
        restaurantSlug: restaurant!.slug,
        restaurantLogo: restaurant!.logo,
        planName: restaurant!.planName,
        targetUrl,
      },
    });
  } catch (error) {
    console.error("GET /api/qr error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch QR details" },
      { status: 500 }
    );
  }
}
