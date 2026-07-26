import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Promo code is required" },
        { status: 400 }
      );
    }

    const formattedCode = code.toUpperCase().trim();

    const promoCode = await db.promoCode.findUnique({
      where: { code: formattedCode },
    });

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: "Invalid promo code" },
        { status: 404 }
      );
    }

    if (!promoCode.isActive) {
      return NextResponse.json(
        { success: false, error: "This promo code has been deactivated" },
        { status: 400 }
      );
    }

    if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "This promo code has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
      },
    });
  } catch (error) {
    console.error("POST /api/public/promo-code/validate error:", error);
    return NextResponse.json(
      { success: false, error: "Promo code validation failed" },
      { status: 500 }
    );
  }
}
