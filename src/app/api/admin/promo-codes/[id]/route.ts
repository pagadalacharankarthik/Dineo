import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;

    await db.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Promo code deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/promo-codes/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete promo code" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    const body = await req.json();

    const promoCode = await db.promoCode.update({
      where: { id },
      data: {
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        code: body.code ? body.code.toUpperCase().trim() : undefined,
        discountType: body.discountType || undefined,
        discountValue: body.discountValue !== undefined ? Number(body.discountValue) : undefined,
        expiresAt: body.expiresAt !== undefined ? (body.expiresAt ? new Date(body.expiresAt) : null) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: promoCode });
  } catch (error) {
    console.error("PATCH /api/admin/promo-codes/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update promo code" },
      { status: 500 }
    );
  }
}
