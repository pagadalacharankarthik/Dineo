import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { z } from "zod";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      displayOrder: z.number().int(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { items } = reorderSchema.parse(body);

    await Promise.all(
      items.map((item) =>
        db.category.updateMany({
          where: { id: item.id, restaurantId: restaurant!.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Categories reordered successfully",
    });
  } catch (error) {
    console.error("POST /api/categories/reorder error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder categories" },
      { status: 400 }
    );
  }
}
