import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const [
      totalRestaurants,
      activeRestaurants,
      totalUsers,
      totalScans,
      totalQRKitRequests,
      totalContactEnquiries,
      trialCount,
      proCount
    ] = await Promise.all([
      db.restaurant.count({ where: { isDeleted: false } }),
      db.restaurant.count({ where: { isDeleted: false, isActive: true, isSuspended: false } }),
      db.user.count(),
      db.qRScan.count(),
      db.qRKitRequest.count(),
      db.contactEnquiry.count(),
      db.restaurant.count({ where: { planName: "FREE_TRIAL", isDeleted: false } }),
      db.restaurant.count({ where: { planName: "PRO", isDeleted: false } })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalRestaurants,
        activeRestaurants,
        totalUsers,
        totalScans,
        totalQRKitRequests,
        totalContactEnquiries,
        plans: {
          FREE_TRIAL: trialCount,
          PRO: proCount,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to load admin stats" }, { status: 500 });
  }
}
