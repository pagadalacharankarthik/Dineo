import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactEnquirySchema } from "@/lib/validations/forms";
import { sendTelegramMessage } from "@/lib/telegram";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limit: max 5 contact submissions per IP per 15 minutes
    const ip = getClientIp(req);
    const { allowed, resetInSeconds } = rateLimit(ip, "contact", 5, 15 * 60);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: `Too many submissions. Please wait ${Math.ceil(resetInSeconds / 60)} minutes before trying again.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = contactEnquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const validatedData = parsed.data;

    const enquiry = await db.contactEnquiry.create({
      data: {
        name: validatedData.name,
        restaurantName: validatedData.restaurantName || null,
        email: validatedData.email,
        phone: validatedData.phone || null,
        message: validatedData.message,
        qrColor: validatedData.qrColor,
      },
    });

    // Send Telegram Notification (Safe / Non-blocking)
    sendTelegramMessage(`
<b>New Contact Enquiry! 💬</b>
<b>Name:</b> ${validatedData.name}
<b>Restaurant:</b> ${validatedData.restaurantName || "N/A"}
<b>Email:</b> ${validatedData.email}
<b>Phone:</b> ${validatedData.phone || "N/A"}
<b>QR Color Pref:</b> ${validatedData.qrColor || "None"}
<b>Message:</b> ${validatedData.message}
    `.trim()).catch(err => console.error("Telegram contact enquiry notify failed:", err));

    return NextResponse.json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit contact enquiry",
      },
      { status: 400 }
    );
  }
}
