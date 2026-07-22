import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const requests = await db.qRKitRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const enrichedRequests = await Promise.all(
      requests.map(async (req) => {
        const restaurant = await db.restaurant.findFirst({
          where: {
            OR: [
              { owner: { email: req.email } },
              { email: req.email },
              { name: { contains: req.restaurantName, mode: "insensitive" } }
            ]
          },
          select: { slug: true }
        });

        return {
          ...req,
          restaurantSlug: restaurant?.slug || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedRequests,
    });
  } catch (error) {
    console.error("GET /api/admin/qr-kits error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch QR Kit requests" }, { status: 500 });
  }
}
