import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { restaurantStatusSchema } from "@/lib/validations/admin";
import { sendMail } from "@/lib/email";

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
      include: {
        owner: true,
      },
    });

    // If activated, send approval onboarding notification email
    if (action === "activate" && restaurant.owner) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const approvalHtml = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 24px; font-weight: 800; color: #ea580c; display: inline-flex; align-items: center; gap: 4px;">
              ⚡ Dineo
            </span>
          </div>
          <h2 style="color: #ea580c; margin-top: 0; margin-bottom: 8px; text-align: center;">Your Restaurant is Approved! 🎉</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 15px;">Hi ${restaurant.owner.name},</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Excellent news! Your restaurant <strong>${restaurant.name}</strong> has been reviewed and approved by our administration team. Your menu management dashboard and public menus are now fully active.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; margin: 20px 0;">
            <h4 style="color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 14px;">Access Details:</h4>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Restaurant Slug:</strong> <code>${restaurant.slug}</code></p>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Your Dashboard:</strong> <a href="${baseUrl}/dashboard" style="color: #ea580c; text-decoration: none; font-weight: 600;">${baseUrl}/dashboard</a></p>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Public Menu URL:</strong> <a href="${baseUrl}/menu/${restaurant.slug}" style="color: #ea580c; text-decoration: none; font-weight: 600;">${baseUrl}/menu/${restaurant.slug}</a></p>
          </div>
          
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">You can now log in, configure your digital categories, customize items, and download high-definition QR poster templates for your dining tables.</p>
          
          <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5;">
            © ${new Date().getFullYear()} Dineo. All rights reserved.<br/>
            Support: <a href="mailto:charanlabssupport@gmail.com" style="color: #ea580c; text-decoration: none;">charanlabssupport@gmail.com</a>
          </div>
        </div>
      `;

      await sendMail({
        to: restaurant.owner.email,
        subject: `Your restaurant workspace "${restaurant.name}" is approved! 🚀`,
        html: approvalHtml,
      }).catch((err) => console.error("Failed to send approval email:", err));
    }

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
        ...(planName !== undefined && { planName }),
        ...(planStatus !== undefined && { planStatus }),
        ...(trialEndDate !== undefined && { trialEndDate: trialEndDate ? new Date(trialEndDate) : null }),
        ...(planExpiresAt !== undefined && { planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : null }),
        ...(showTrialBanner !== undefined && { showTrialBanner }),
        ...(showOfferBanner !== undefined && { showOfferBanner }),
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
