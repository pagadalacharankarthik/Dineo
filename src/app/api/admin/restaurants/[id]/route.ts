import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { restaurantStatusSchema } from "@/lib/validations/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = restaurantStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { action } = parsed.data;

    let updateData: any = {};
    if (action === "suspend") {
      updateData = { isSuspended: true, isActive: false };
    } else if (action === "activate") {
      updateData = { isSuspended: false, isActive: true };
    } else if (action === "delete") {
      updateData = { isDeleted: true };
    } else if (action === "restore") {
      updateData = { isDeleted: false };
    }

    const restaurant = await db.restaurant.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("PATCH /api/admin/restaurants/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update restaurant status" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const { planName, planStatus, trialEndDate, planExpiresAt, showTrialBanner, showOfferBanner } = body;

    const restaurant = await db.restaurant.update({
      where: { id },
      data: {
        planName: planName || undefined,
        planStatus: planStatus || undefined,
        trialEndDate: trialEndDate ? new Date(trialEndDate) : undefined,
        planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : undefined,
        showTrialBanner: showTrialBanner !== undefined ? showTrialBanner : undefined,
        showOfferBanner: showOfferBanner !== undefined ? showOfferBanner : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("PUT /api/admin/restaurants/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update subscription settings" }, { status: 500 });
  }
}
