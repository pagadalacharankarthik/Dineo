import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { enquiryStatusSchema } from "@/lib/validations/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = enquiryStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { status, isRead } = parsed.data;

    const enquiry = await db.contactEnquiry.update({
      where: { id },
      data: {
        status,
        isRead: isRead !== undefined ? isRead : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error("PATCH /api/admin/contact/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update enquiry status" }, { status: 500 });
  }
}
