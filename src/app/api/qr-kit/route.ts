import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qrKitRequestSchema } from "@/lib/validations/forms";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = qrKitRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const validatedData = parsed.data;

    const request = await db.qRKitRequest.create({
      data: {
        restaurantName: validatedData.restaurantName,
        contactPerson: validatedData.contactPerson,
        phone: validatedData.phone,
        email: validatedData.email,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        pincode: validatedData.pincode,
        tableCount: validatedData.tableCount,
        quantityNeeded: validatedData.quantityNeeded,
        notes: validatedData.notes || null,
        qrColor: validatedData.qrColor,
      },
    });

    // Send Telegram Notification (Safe / Non-blocking)
    const getKitPrice = (type: string) => {
      switch (type) {
        case "ACRYLIC_STAND": return 199;
        case "STICKER_PACK": return 99;
        case "WINDOW_STICKER": return 149;
        case "COMBO_PACK": return 299;
        default: return 0;
      }
    };
    const notesStr = validatedData.notes || "";
    const kitTypeMatch = notesStr.match(/Kit Type: ([A-Z_]+)/);
    const kitType = kitTypeMatch ? kitTypeMatch[1] : "ACRYLIC_STAND";
    const unitPrice = getKitPrice(kitType);
    const subtotal = unitPrice * validatedData.quantityNeeded;
    const deliveryCharge = subtotal >= 1000 ? 0 : 99;
    const totalAmount = subtotal + deliveryCharge;

    sendTelegramMessage(`
<b>New QR Kit Request! 📦</b>
<b>Restaurant:</b> ${validatedData.restaurantName}
<b>Contact Person:</b> ${validatedData.contactPerson}
<b>Phone:</b> ${validatedData.phone}
<b>Email:</b> ${validatedData.email}
<b>Address:</b> ${validatedData.address}, ${validatedData.city}, ${validatedData.state} - ${validatedData.pincode}
<b>Tables:</b> ${validatedData.tableCount}
<b>Qty Needed:</b> ${validatedData.quantityNeeded}
<b>QR Color:</b> ${validatedData.qrColor}
<b>Pricing Summary:</b>
• Subtotal: ₹${subtotal}
• Delivery: ${deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
• <b>Total Cost:</b> ₹${totalAmount}
<b>Notes:</b> ${validatedData.notes || "None"}
    `.trim()).catch(err => console.error("Telegram QR Kit request notify failed:", err));

    return NextResponse.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("POST /api/qr-kit error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit QR kit request",
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const { session, restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    // Tenant isolation: fetch requests associated with this user's email or matching this restaurant's name
    const requests = await db.qRKitRequest.findMany({
      where: {
        OR: [
          { email: session!.user.email },
          { restaurantName: { equals: restaurant!.name, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("GET /api/qr-kit error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch QR kit requests" },
      { status: 500 }
    );
  }
}
