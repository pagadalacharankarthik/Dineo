import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Find the verification record
    const verification = await db.verification.findFirst({
      where: {
        identifier: email,
        value: code,
      },
    });

    if (!verification) {
      return NextResponse.json({ success: false, error: "Invalid verification code. Please check and try again." }, { status: 400 });
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      // Delete expired code
      await db.verification.delete({ where: { id: verification.id } });
      return NextResponse.json({ success: false, error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    // Update user: emailVerified = true
    const user = await db.user.update({
      where: { email },
      data: { emailVerified: true },
      include: {
        restaurant: true,
      },
    });

    // Delete verification record
    await db.verification.delete({ where: { id: verification.id } });

    // Send onboarding welcome email to the merchant AFTER verifying their email successfully
    if (user && user.restaurant) {
      const welcomeHtml = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 24px; font-weight: 800; color: #ea580c; display: inline-flex; align-items: center; gap: 4px;">
              ⚡ Dineo
            </span>
          </div>
          <h2 style="color: #ea580c; margin-top: 0; margin-bottom: 8px;">Welcome to Dineo, ${user.name}! 🎉</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 0;">Thank you for registering your restaurant <strong>${user.restaurant.name}</strong> on Dineo! Your application has been successfully received and is currently <strong>under review</strong> by our operations team.</p>
          
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Once approved, you will receive another email confirming that your account is active and ready to access dashboard features.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; margin: 20px 0;">
            <h4 style="color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 14px;">Onboarding Status:</h4>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Restaurant Name:</strong> ${user.restaurant.name}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Status:</strong> Under Review ⏳</p>
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.6;">While your account is under review, you can prepare your menu files or reach out to our team at <a href="mailto:charanlabssupport@gmail.com" style="color: #ea580c; text-decoration: none;">charanlabssupport@gmail.com</a> if you have any questions.</p>

          <p style="font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px; line-height: 1.5;">Thank you for your patience! We'll get back to you shortly.</p>
        </div>
      `;

      await sendMail({
        to: user.email,
        subject: "Welcome to Dineo 🎉 - Registration Under Review",
        html: welcomeHtml,
      }).catch((err) => console.error("Welcome email delivery failed:", err));
    }

    return NextResponse.json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("POST /api/public/verify-otp error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
