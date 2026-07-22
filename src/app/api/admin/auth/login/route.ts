import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, generateSessionToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { adminLoginSchema } from "@/lib/validations/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const admin = await db.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await db.adminSession.create({
      data: { adminId: admin.id, token, expiresAt },
    });

    const res = NextResponse.json({
      success: true,
      data: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });

    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("POST /api/admin/auth/login error:", error);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}
