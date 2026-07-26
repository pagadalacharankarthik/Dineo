import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const promoCodes = await db.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: promoCodes });
  } catch (error) {
    console.error("GET /api/admin/promo-codes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { code, discountType, discountValue, expiresAt, isActive } = await req.json();

    if (!code || !discountValue) {
      return NextResponse.json(
        { success: false, error: "Code and discount value are required" },
        { status: 400 }
      );
    }

    const formattedCode = code.toUpperCase().trim();

    // Check if duplicate code exists
    const existing = await db.promoCode.findUnique({
      where: { code: formattedCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A promo code with this code already exists" },
        { status: 400 }
      );
    }

    const promoCode = await db.promoCode.create({
      data: {
        code: formattedCode,
        discountType: discountType || "PERCENT",
        discountValue: Number(discountValue),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: promoCode });
  } catch (error) {
    console.error("POST /api/admin/promo-codes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create promo code" },
      { status: 500 }
    );
  }
}
