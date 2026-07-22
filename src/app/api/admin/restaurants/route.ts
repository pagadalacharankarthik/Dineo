import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const restaurants = await db.restaurant.findMany({
      where: includeDeleted ? undefined : { isDeleted: false },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            menuItems: true,
            qrCodes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    console.error("GET /api/admin/restaurants error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch restaurants" }, { status: 500 });
  }
}
