import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/email";

export async function POST(req: Request) {
  const { admin, errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { newEmail } = await req.json();
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Verify if email is already taken by another admin
    const existingAdmin = await db.adminUser.findFirst({
      where: {
        email: newEmail,
        NOT: { id: admin!.id },
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: "This email address is already in use" },
        { status: 400 }
      );
    }

    // Generate 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in database
    await db.adminOTP.upsert({
      where: { email: newEmail },
      update: {
        code: otpCode,
        expiresAt,
      },
      create: {
        email: newEmail,
        code: otpCode,
        expiresAt,
      },
    });

    // Send email with OTP
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #ea580c; margin-bottom: 6px;">Dineo Admin Security</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 0;">Super Admin Email Change Verification</p>
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 12px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #0f172a;">${otpCode}</span>
        </div>
        <p style="font-size: 13px; color: #64748b;">This OTP code will expire in 10 minutes. If you did not request this update, please secure your credentials immediately.</p>
      </div>
    `;

    const emailSent = await sendMail({
      to: newEmail,
      subject: `Dineo - Your Admin Verification OTP (${otpCode})`,
      html,
    });

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to deliver verification email. Check SMTP settings." },
        { status: 500 }
      );
    }

    const isMocked = !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS;

    return NextResponse.json({
      success: true,
      message: "A verification OTP has been sent to the requested email address.",
      ...(isMocked ? { mockOtp: otpCode } : {}),
    });
  } catch (error) {
    console.error("POST /api/admin/profile/send-otp error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
