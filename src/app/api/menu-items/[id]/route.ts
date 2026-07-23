import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { menuItemBaseSchema } from "@/lib/validations/menu";

export async function PUT(
  req: Request,
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

    const body = await req.json();
    const validated = menuItemBaseSchema.partial().parse(body);

    // Validate discount price vs original price manually
    const finalPrice = validated.price !== undefined ? validated.price : existing.price;
    const finalDiscountPrice = validated.discountPrice !== undefined ? validated.discountPrice : existing.discountPrice;

    if (finalDiscountPrice !== null && finalDiscountPrice !== undefined) {
      if (finalDiscountPrice > finalPrice) {
        return NextResponse.json(
          { success: false, error: "Discount price cannot exceed the original price" },
          { status: 400 }
        );
      }
    }

    if (validated.categoryId) {
      const category = await db.category.findFirst({
        where: { id: validated.categoryId, restaurantId: restaurant!.id },
      });
      if (!category) {
        return NextResponse.json(
          { success: false, error: "Selected category not found" },
          { status: 400 }
        );
      }
    }

    const updated = await db.menuItem.update({
      where: { id },
      data: validated,
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/menu-items/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update menu item" },
      { status: 400 }
    );
  }
}

export async function DELETE(
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

    await db.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/menu-items/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
