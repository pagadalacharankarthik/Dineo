import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validations/menu";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await req.json();
    const validated = categorySchema.partial().parse(body);

    const existing = await db.category.findFirst({
      where: { id, restaurantId: restaurant!.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    if (validated.name && validated.name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await db.category.findFirst({
        where: {
          restaurantId: restaurant!.id,
          name: { equals: validated.name, mode: "insensitive" },
          id: { not: id },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "Category name already exists" },
          { status: 400 }
        );
      }
    }

    const updated = await db.category.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update category" },
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

    const existing = await db.category.findFirst({
      where: { id, restaurantId: restaurant!.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
