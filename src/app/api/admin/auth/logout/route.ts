import { NextResponse } from "next/server";
import { getAdminSession, ADMIN_COOKIE } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getAdminSession();
    if (session) {
      await db.adminSession.delete({ where: { id: session.id } }).catch(() => {});
    }
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE, "", { expires: new Date(0), path: "/" });
    return res;
  } catch (error) {
    console.error("POST /api/admin/auth/logout error:", error);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
