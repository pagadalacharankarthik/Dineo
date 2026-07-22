import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const [totalCategories, totalMenuItems, availableItems, outOfStockItems, qrCode] =
      await Promise.all([
        db.category.count({ where: { restaurantId: restaurant!.id } }),
        db.menuItem.count({ where: { restaurantId: restaurant!.id } }),
        db.menuItem.count({ where: { restaurantId: restaurant!.id, isAvailable: true } }),
        db.menuItem.count({ where: { restaurantId: restaurant!.id, isAvailable: false } }),
        db.qRCode.findFirst({ where: { restaurantId: restaurant!.id, qrType: "RESTAURANT_MAIN" } }),
      ]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const publicUrl = `${baseUrl}/menu/${restaurant!.slug}`;

    return NextResponse.json({
      success: true,
      data: {
        hasRestaurant: Boolean(restaurant!.logo && restaurant!.address && restaurant!.mobile),
        restaurantName: restaurant!.name,
        restaurantSlug: restaurant!.slug,
        publicUrl,
        totalCategories,
        totalMenuItems,
        availableItems,
        outOfStockItems,
        qrStatus: qrCode ? "active" : "pending",
        qrCodeId: qrCode?.id ?? null,
        todayScans: qrCode?.scansCount ?? 0,
        totalQrScans: qrCode?.scansCount ?? 0,
        qrDownloads: qrCode?.downloadsCount ?? 0,
        isActive: restaurant!.isActive,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
