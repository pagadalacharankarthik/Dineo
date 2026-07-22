import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const totalRestaurants = await db.restaurant.count({
      where: { isDeleted: false },
    });

    const activeRestaurants = await db.restaurant.count({
      where: { isDeleted: false, isActive: true, isSuspended: false },
    });

    const totalUsers = await db.user.count();

    const totalScans = await db.qRScan.count();

    const totalQRKitRequests = await db.qRKitRequest.count();

    const totalContactEnquiries = await db.contactEnquiry.count();

    // Get simple growth / stats over time or plans
    const trialCount = await db.restaurant.count({
      where: { planName: "FREE_TRIAL", isDeleted: false },
    });

    const proCount = await db.restaurant.count({
      where: { planName: "PRO", isDeleted: false },
    });

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
