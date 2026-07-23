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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <span style="font-size: 24px; font-weight: 800; color: #ea580c; display: inline-flex; align-items: center; gap: 4px;">
            ⚡ Dineo
          </span>
        </div>
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700; text-align: center;">Super Admin: Verification Code</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 15px; text-align: center;">Use the security code below to complete your profile email address update:</p>
        
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 18px; border-radius: 12px; margin: 25px 0; text-align: center;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; font-family: monospace;">${otpCode}</span>
        </div>
        
        <p style="font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">This security code will expire in 10 minutes. If you did not initiate this change, please ignore this email and secure your administrator login credentials.</p>
        
        <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5;">
          © ${new Date().getFullYear()} Dineo. All rights reserved.<br/>
          Support: <a href="mailto:charanlabssupport@gmail.com" style="color: #ea580c; text-decoration: none;">charanlabssupport@gmail.com</a>
        </div>
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
