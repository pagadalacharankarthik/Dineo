import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function POST(
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

    const maxOrder = await db.menuItem.aggregate({
      where: { restaurantId: restaurant!.id, categoryId: existing.categoryId },
      _max: { displayOrder: true },
    });

    const duplicate = await db.menuItem.create({
      data: {
        restaurantId: existing.restaurantId,
        categoryId: existing.categoryId,
        name: `${existing.name} (Copy)`,
        description: existing.description,
        price: existing.price,
        imageUrl: existing.imageUrl,
        isVeg: existing.isVeg,
        isRecommended: existing.isRecommended,
        isBestSeller: existing.isBestSeller,
        isChefSpecial: existing.isChefSpecial,
        isAvailable: existing.isAvailable,
        isHidden: existing.isHidden,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      success: true,
      data: duplicate,
      message: "Menu item duplicated successfully",
    });
  } catch (error) {
    console.error("POST /api/menu-items/[id]/duplicate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to duplicate menu item" },
      { status: 500 }
    );
  }
}
