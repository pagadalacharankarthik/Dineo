import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { z } from "zod";

const bulkItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  items: z.array(
    z.object({
      name: z.string().min(2, "Item name must be at least 2 characters").max(100),
      price: z.number().min(0, "Price must be non-negative"),
      description: z.string().max(500).optional().nullable(),
      isVeg: z.boolean().default(true),
    })
  ).min(1, "Must add at least one item"),
});

export async function POST(req: Request) {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const validated = bulkItemSchema.parse(body);

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

    const maxOrderAgg = await db.menuItem.aggregate({
      where: { restaurantId: restaurant!.id, categoryId: validated.categoryId },
      _max: { displayOrder: true },
    });

    let currentOrder = (maxOrderAgg._max.displayOrder ?? -1) + 1;

    const insertData = validated.items.map((item) => ({
      name: item.name,
      price: item.price,
      description: item.description || null,
      isVeg: item.isVeg,
      categoryId: validated.categoryId,
      restaurantId: restaurant!.id,
      displayOrder: currentOrder++,
      isAvailable: true,
      isHidden: false,
      isRecommended: false,
      isBestSeller: false,
      isChefSpecial: false,
    }));

    await db.menuItem.createMany({
      data: insertData,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${validated.items.length} items to category ${category.name}`,
    });
  } catch (error) {
    console.error("POST /api/menu-items/bulk error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to add items in bulk" },
      { status: 400 }
    );
  }
}
