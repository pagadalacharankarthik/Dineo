import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactEnquirySchema } from "@/lib/validations/forms";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = contactEnquirySchema.parse(body);

    const enquiry = await db.contactEnquiry.create({
      data: {
        name: validatedData.name,
        restaurantName: validatedData.restaurantName || null,
        email: validatedData.email,
        phone: validatedData.phone || null,
        message: validatedData.message,
      },
    });

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
