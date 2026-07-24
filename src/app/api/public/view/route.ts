import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { categoryId, menuItemId } = await req.json();

    if (!categoryId && !menuItemId) {
      return NextResponse.json(
        { success: false, error: "categoryId or menuItemId is required" },
        { status: 400 }
      );
    }

    if (categoryId) {
      // 1. Increment Category viewsCount
      await db.category.update({
        where: { id: categoryId },
        data: { viewsCount: { increment: 1 } },
      });

      // 2. Increment MenuItem viewsCount for all items in that category
      await db.menuItem.updateMany({
        where: { categoryId },
        data: { viewsCount: { increment: 1 } },
      });
    }

    if (menuItemId) {
      // Direct increment for a single menu item (if clicked/expanded)
      await db.menuItem.update({
        where: { id: menuItemId },
        data: { viewsCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/public/view error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record view metrics" },
      { status: 500 }
    );
  }
}
