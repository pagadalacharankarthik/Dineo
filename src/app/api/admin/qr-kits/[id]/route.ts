import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { qrKitStatusSchema } from "@/lib/validations/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = qrKitStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { status } = parsed.data;

    const request = await db.qRKitRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("PATCH /api/admin/qr-kits/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update QR Kit request status" }, { status: 500 });
  }
}
