import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { admin, errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;
  return NextResponse.json({
    success: true,
    data: { id: admin!.id, name: admin!.name, email: admin!.email, role: admin!.role },
  });
}
