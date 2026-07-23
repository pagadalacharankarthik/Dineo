import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";
import { sendTelegramMessage } from "@/lib/telegram";

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
        isActive: false, // Set to false: requires administrator approval!
      },
    });

    // Send Telegram Notification (Safe / Non-blocking)
    sendTelegramMessage(`
🔔 <b>New Restaurant Registration (Pending Approval)</b>

🏢 <b>Restaurant:</b> ${restaurant.name}
👤 <b>Owner:</b> ${session.user.name}
📧 <b>Email:</b> ${session.user.email}
🔗 <b>Slug:</b> /menu/${restaurant.slug}

<i>Please log into the Admin panel to approve or reject this restaurant.</i>
    `.trim()).catch(err => console.error("Telegram onboarding notify failed:", err));

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

    // Send onboarding welcome email to the restaurant admin (Pending Approval)
    const welcomeHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <span style="font-size: 24px; font-weight: 800; color: #ea580c; display: inline-flex; align-items: center; gap: 4px;">
            ⚡ Dineo
          </span>
        </div>
        <h2 style="color: #ea580c; margin-top: 0; margin-bottom: 8px;">Welcome to Dineo, ${session.user.name}! 🎉</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 0;">Thank you for registering your restaurant <strong>${restaurant.name}</strong> on Dineo! Your application has been successfully received and is currently <strong>under review</strong> by our operations team.</p>
        
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Once approved, you will receive another email confirming that your account is active and ready to access dashboard features.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; margin: 20px 0;">
          <h4 style="color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 14px;">Onboarding Status:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Restaurant Name:</strong> ${restaurant.name}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Status:</strong> Under Review ⏳</p>
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.6;">While your account is under review, you can prepare your menu files or reach out to our team at <a href="mailto:charanlabssupport@gmail.com" style="color: #ea580c; text-decoration: none;">charanlabssupport@gmail.com</a> if you have any questions.</p>

        <p style="font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px; line-height: 1.5;">Thank you for your patience! We'll get back to you shortly.</p>
      </div>
    `;

    await sendMail({
      to: session.user.email,
      subject: "Welcome to Dineo 🎉 - Registration Under Review",
      html: welcomeHtml,
    }).catch(err => console.error("Welcome email delivery failed:", err));
  }

  return { session, restaurant, errorResponse: null };
}
