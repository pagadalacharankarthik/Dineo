import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qrKitRequestSchema } from "@/lib/validations/forms";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = qrKitRequestSchema.parse(body);

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
      },
    });

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
