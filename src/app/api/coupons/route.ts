import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { couponSchema } from "@/lib/validations/coupon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const coupons = await db.coupon.findMany({
      where: { restaurantId: restaurant!.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error("GET /api/coupons error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { code, discountType, discountValue, expiresAt, isActive } = parsed.data;

    // Check code duplication for this restaurant
    const existing = await db.coupon.findUnique({
      where: {
        restaurantId_code: {
          restaurantId: restaurant!.id,
          code,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A coupon with this code already exists" },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        restaurantId: restaurant!.id,
        code,
        discountType,
        discountValue,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
      },
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    console.error("POST /api/coupons error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
