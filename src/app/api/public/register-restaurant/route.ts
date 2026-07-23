import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendMail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, restaurantName } = await req.json();
    if (!email || !restaurantName) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Find the user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Check if restaurant already exists for this owner
    const existing = await db.restaurant.findUnique({ where: { ownerId: user.id } });
    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    // Generate slug
    const baseSlug = restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "my-restaurant";
    
    let slug = baseSlug;
    let counter = 1;
    while (await db.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the restaurant (with isActive = false for admin review)
    const restaurant = await db.restaurant.create({
      data: {
        name: restaurantName,
        slug,
        ownerId: user.id,
        isActive: false, // Pending review
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

    // Send Telegram Notification (Safe / Non-blocking)
    sendTelegramMessage(`
🔔 <b>New Restaurant Registration (Pending Approval)</b>

🏢 <b>Restaurant:</b> ${restaurant.name}
👤 <b>Owner:</b> ${user.name}
📧 <b>Email:</b> ${user.email}
🔗 <b>Slug:</b> /menu/${restaurant.slug}

<i>Please log into the Admin panel to approve or reject this restaurant.</i>
    `.trim()).catch((err) => console.error("Telegram onboarding notify failed:", err));

    return NextResponse.json({ success: true, data: restaurant });
  } catch (error) {
    console.error("POST /api/public/register-restaurant error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
