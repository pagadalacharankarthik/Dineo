import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const restaurant = await db.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        coverImage: true,
        description: true,
        address: true,
        mobile: true,
        email: true,
        openingTime: true,
        closingTime: true,
        googleReviewUrl: true,
        planName: true,
        isActive: true,
        isSuspended: true,
        isDeleted: true,
        updatedAt: true,
        categories: {
          where: { isHidden: false, isDisabled: false },
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            displayOrder: true,
            updatedAt: true,
            menuItems: {
              where: { isHidden: false },
              orderBy: { displayOrder: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                discountPrice: true,
                imageUrl: true,
                isVeg: true,
                isRecommended: true,
                isBestSeller: true,
                isChefSpecial: true,
                isAvailable: true,
                displayOrder: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!restaurant || restaurant.isDeleted) {
      return NextResponse.json(
        { success: false, error: "Restaurant menu not found" },
        { status: 404 }
      );
    }

    if (restaurant.isSuspended) {
      return NextResponse.json(
        { success: false, error: "This restaurant's menu is temporarily suspended. Please contact the administrator or restaurant staff." },
        { status: 403 }
      );
    }

    // Compute dynamic lastUpdated time
    let lastUpdatedTime = new Date(restaurant.updatedAt);
    restaurant.categories.forEach((cat) => {
      const catDate = new Date(cat.updatedAt);
      if (catDate > lastUpdatedTime) lastUpdatedTime = catDate;
      cat.menuItems.forEach((item) => {
        const itemDate = new Date(item.updatedAt);
        if (itemDate > lastUpdatedTime) lastUpdatedTime = itemDate;
      });
    });

    // Increment scan and view metrics asynchronously in background
    Promise.all([
      db.category.updateMany({
        where: { restaurantId: restaurant.id, isHidden: false, isDisabled: false },
        data: { viewsCount: { increment: 1 } },
      }),
      db.menuItem.updateMany({
        where: { restaurantId: restaurant.id, isHidden: false },
        data: { viewsCount: { increment: 1 } },
      }),
    ]).catch((err) => console.error("Metrics background update error:", err));

    return NextResponse.json({
      success: true,
      data: {
        ...restaurant,
        lastUpdated: lastUpdatedTime.toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/public/menu/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch public menu" },
      { status: 500 }
    );
  }
}
