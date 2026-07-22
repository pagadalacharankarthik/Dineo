import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validations/user";
import { successResponse, errorResponse } from "@/lib/utils";

// GET /api/user — get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        mobile: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 });
    }

    return NextResponse.json(successResponse(user));
  } catch (error) {
    console.error("[GET /api/user]", error);
    return NextResponse.json(errorResponse("Failed to fetch user"), {
      status: 500,
    });
  }
}

// PUT /api/user — update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const validation = profileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: validation.data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        mobile: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(successResponse(updated, "Profile updated successfully"));
  } catch (error) {
    console.error("[PUT /api/user]", error);
    return NextResponse.json(errorResponse("Failed to update profile"), {
      status: 500,
    });
  }
}
