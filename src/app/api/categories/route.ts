import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validations/menu";

export async function GET() {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const categories = await db.category.findMany({
      where: { restaurantId: restaurant!.id },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const validated = categorySchema.parse(body);

    // Duplicate check for category name in same restaurant
    const existing = await db.category.findFirst({
      where: {
        restaurantId: restaurant!.id,
        name: { equals: validated.name, mode: "insensitive" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Category name already exists" },
        { status: 400 }
      );
    }

    // Get max display order
    const maxOrder = await db.category.aggregate({
      where: { restaurantId: restaurant!.id },
      _max: { displayOrder: true },
    });

    const category = await db.category.create({
      data: {
        ...validated,
        restaurantId: restaurant!.id,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create category" },
      { status: 400 }
    );
  }
}
