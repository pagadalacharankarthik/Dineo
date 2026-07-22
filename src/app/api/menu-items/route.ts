import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { menuItemSchema } from "@/lib/validations/menu";

export async function GET(req: Request) {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const menuItems = await db.menuItem.findMany({
      where: {
        restaurantId: restaurant!.id,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ category: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    console.error("GET /api/menu-items error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const validated = menuItemSchema.parse(body);

    // Verify category belongs to user's restaurant
    const category = await db.category.findFirst({
      where: { id: validated.categoryId, restaurantId: restaurant!.id },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Selected category not found" },
        { status: 400 }
      );
    }

    const maxOrder = await db.menuItem.aggregate({
      where: { restaurantId: restaurant!.id, categoryId: validated.categoryId },
      _max: { displayOrder: true },
    });

    const menuItem = await db.menuItem.create({
      data: {
        ...validated,
        restaurantId: restaurant!.id,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error("POST /api/menu-items error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create menu item" },
      { status: 400 }
    );
  }
}
