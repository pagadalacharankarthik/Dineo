import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function getAuthenticatedRestaurant() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session?.user) {
    return { session: null, restaurant: null, errorResponse: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }

  let restaurant = await db.restaurant.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!restaurant) {
    // Auto-create restaurant for owner if not exists
    const baseSlug = session.user.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "my-restaurant";
    let slug = baseSlug;
    let counter = 1;

    while (await db.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    restaurant = await db.restaurant.create({
      data: {
        name: session.user.name + "'s Restaurant",
        slug,
        ownerId: session.user.id,
      },
    });

    // Create default main QR code for restaurant
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await db.qRCode.create({
      data: {
        restaurantId: restaurant.id,
        code: `qr-${restaurant.slug}`,
        targetUrl: `${baseUrl}/menu/${restaurant.slug}`,
        qrType: "RESTAURANT_MAIN",
      },
    });
  }

  return { session, restaurant, errorResponse: null };
}
