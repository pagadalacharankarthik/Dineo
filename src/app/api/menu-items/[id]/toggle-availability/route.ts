import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const existing = await db.menuItem.findFirst({
      where: { id, restaurantId: restaurant!.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Menu item not found" },
        { status: 404 }
      );
    }

    const updated = await db.menuItem.update({
      where: { id },
      data: { isAvailable: !existing.isAvailable },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: updated.isAvailable ? "Item marked as Available" : "Item marked as Out of Stock",
    });
  } catch (error) {
    console.error("PATCH /api/menu-items/[id]/toggle-availability error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle availability" },
      { status: 500 }
    );
  }
}
