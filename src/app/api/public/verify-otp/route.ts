import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    await db.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    // Delete verification record
    await db.verification.delete({ where: { id: verification.id } });

    return NextResponse.json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("POST /api/public/verify-otp error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
