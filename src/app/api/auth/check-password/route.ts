import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Find the password reset token in the database
    const resetRecord = await db.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date() || resetRecord.used) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired password reset link" },
        { status: 400 }
      );
    }

    // Find the credential account for the target user
    const account = await db.account.findFirst({
      where: {
        userId: resetRecord.userId,
        providerId: "credential",
      },
    });

    if (!account || !account.password) {
      return NextResponse.json(
        { success: false, error: "User account credentials not found" },
        { status: 404 }
      );
    }

    // Compare input password hash with existing hash
    const isSame = await bcrypt.compare(password, account.password);

    return NextResponse.json({
      success: true,
      isSame,
    });
  } catch (error) {
    console.error("POST /api/auth/check-password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify password uniqueness" },
      { status: 500 }
    );
  }
}
