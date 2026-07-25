import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    return NextResponse.json({
      success: true,
      exists: !!user,
    });
  } catch (error) {
    console.error("POST /api/auth/check-email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check email existence" },
      { status: 500 }
    );
  }
}
