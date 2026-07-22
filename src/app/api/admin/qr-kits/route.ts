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

    const emails = requests.map((r) => r.email).filter(Boolean);
    const names = requests.map((r) => r.restaurantName).filter(Boolean);

    const restaurants = await db.restaurant.findMany({
      where: {
        OR: [
          { email: { in: emails } },
          { owner: { email: { in: emails } } },
          { name: { in: names } }
        ]
      },
      select: {
        name: true,
        slug: true,
        email: true,
        owner: {
          select: { email: true }
        }
      }
    });

    const enrichedRequests = requests.map((req) => {
      const match = restaurants.find(
        (rest) =>
          rest.email === req.email ||
          rest.owner?.email === req.email ||
          rest.name.toLowerCase().includes(req.restaurantName.toLowerCase()) ||
          req.restaurantName.toLowerCase().includes(rest.name.toLowerCase())
      );
      return {
        ...req,
        restaurantSlug: match?.slug || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedRequests,
    });
  } catch (error) {
    console.error("GET /api/admin/qr-kits error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch QR Kit requests" }, { status: 500 });
  }
}
