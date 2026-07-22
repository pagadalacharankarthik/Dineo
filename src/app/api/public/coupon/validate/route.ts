import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { slug, code } = await req.json();

    if (!slug || !code) {
      return NextResponse.json(
        { success: false, error: "Restaurant slug and coupon code are required" },
        { status: 400 }
      );
    }

    const restaurant = await db.restaurant.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const coupon = await db.coupon.findUnique({
      where: {
        restaurantId_code: {
          restaurantId: restaurant.id,
          code: code.trim().toUpperCase(),
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: "This coupon has been deactivated" },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "This coupon has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error("POST /api/public/coupon/validate error:", error);
    return NextResponse.json(
      { success: false, error: "Coupon validation failed" },
      { status: 500 }
    );
  }
}
