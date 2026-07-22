import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export const ADMIN_COOKIE = "admin_session_token";

export async function getAdminSession() {
  const reqHeaders = await headers();
  const cookieHeader = reqHeaders.get("cookie") || "";
  const tokenMatch = cookieHeader.match(new RegExp(`${ADMIN_COOKIE}=([^;]+)`));
  const token = tokenMatch?.[1];
  if (!token) return null;

  const session = await db.adminSession.findUnique({
    where: { token },
    include: { admin: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.adminSession.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return session;
}

export async function getAuthenticatedAdmin() {
  const session = await getAdminSession();
  if (!session || !session.admin.isActive) {
    return {
      admin: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  return { admin: session.admin, errorResponse: null };
}
