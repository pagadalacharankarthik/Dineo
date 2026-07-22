import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const restaurantId = restaurant!.id;

    // Time ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Queries running in parallel for maximum performance
    const [
      totalScans,
      todayScans,
      weeklyScans,
      monthlyScans,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      locationBreakdown,
      mostViewedCategories,
      mostViewedItems,
      qrDetails,
    ] = await Promise.all([
      // Total Scans (Restricted to last 30 days for db optimization)
      db.qRScan.count({ where: { restaurantId, scannedAt: { gte: thirtyDaysAgo } } }),
      // Today's Scans
      db.qRScan.count({
        where: {
          restaurantId,
          scannedAt: { gte: todayStart },
        },
      }),
      // Weekly Scans
      db.qRScan.count({
        where: {
          restaurantId,
          scannedAt: { gte: sevenDaysAgo },
        },
      }),
      // Monthly Scans
      db.qRScan.count({
        where: {
          restaurantId,
          scannedAt: { gte: thirtyDaysAgo },
        },
      }),
      // Device breakdown (Last 30 Days)
      db.qRScan.groupBy({
        by: ["deviceType"],
        where: { restaurantId, scannedAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),
      // Browser breakdown (Last 30 Days)
      db.qRScan.groupBy({
        by: ["browser"],
        where: { restaurantId, scannedAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),
      // OS breakdown (Last 30 Days)
      db.qRScan.groupBy({
        by: ["os"],
        where: { restaurantId, scannedAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),
      // Location breakdown (Last 30 Days)
      db.qRScan.groupBy({
        by: ["country", "city"],
        where: { restaurantId, scannedAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),
      // Most viewed categories
      db.category.findMany({
        where: { restaurantId },
        orderBy: { viewsCount: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          viewsCount: true,
        },
      }),
      // Most viewed menu items
      db.menuItem.findMany({
        where: { restaurantId },
        orderBy: { viewsCount: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          viewsCount: true,
          price: true,
        },
      }),
      // QR Details for downloads stats
      db.qRCode.findFirst({
        where: { restaurantId, qrType: "RESTAURANT_MAIN" },
        select: { downloadsCount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        scans: {
          total: totalScans,
          today: todayScans,
          weekly: weeklyScans,
          monthly: monthlyScans,
        },
        devices: deviceBreakdown.map((d) => ({
          name: d.deviceType || "Unknown",
          value: d._count.id,
        })),
        browsers: browserBreakdown.map((b) => ({
          name: b.browser || "Unknown",
          value: b._count.id,
        })),
        operatingSystems: osBreakdown.map((o) => ({
          name: o.os || "Unknown",
          value: o._count.id,
        })),
        locations: locationBreakdown.map((l) => ({
          country: l.country || "Unknown",
          city: l.city || "Unknown",
          value: l._count.id,
        })),
        mostViewedCategories,
        mostViewedItems,
        qrDownloads: qrDetails?.downloadsCount ?? 0,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load analytics statistics" },
      { status: 500 }
    );
  }
}
