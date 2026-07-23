import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";

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

    // Send onboarding welcome email to the restaurant admin
    const welcomeHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
        <h2 style="color: #ea580c; margin-top: 0; margin-bottom: 8px;">Welcome to Dineo, ${session.user.name}! 🎉</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 0;">We are excited to help you transform your restaurant experience. Your account and restaurant menu workspace have been successfully created.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; margin: 20px 0;">
          <h4 style="color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 14px;">Restaurant Workspace Details:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Restaurant Name:</strong> ${restaurant.name}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Your Dashboard:</strong> <a href="${baseUrl}/dashboard" style="color: #ea580c; text-decoration: none; font-weight: 600;">${baseUrl}/dashboard</a></p>
          <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Public Menu Slug:</strong> <a href="${baseUrl}/menu/${restaurant.slug}" style="color: #ea580c; text-decoration: none; font-weight: 600;">/menu/${restaurant.slug}</a></p>
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.6;"><strong>Next Steps:</strong></p>
        <ul style="color: #475569; font-size: 13.5px; padding-left: 20px; line-height: 1.6;">
          <li style="margin-bottom: 6px;">Create Menu Categories (e.g. Appetizers, Main Course, Drinks)</li>
          <li style="margin-bottom: 6px;">Add Menu Items with pricing, dietary tags, and photos</li>
          <li style="margin-bottom: 6px;">Print your table QR codes and download the standee templates!</li>
        </ul>

        <p style="font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px; line-height: 1.5;">If you need any help getting set up, simply reply to this email. We're here to assist!</p>
      </div>
    `;

    await sendMail({
      to: session.user.email,
      subject: "Welcome to Dineo 🎉 - Setup your smart QR menu",
      html: welcomeHtml,
    }).catch(err => console.error("Welcome email delivery failed:", err));
  }

  return { session, restaurant, errorResponse: null };
}
