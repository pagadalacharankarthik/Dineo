import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, verifyPassword, hashPassword } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { admin, errorResponse } = await getAuthenticatedAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { 
      name, 
      email, 
      otpCode, 
      currentPassword, 
      newPassword 
    } = await req.json();

    const updateData: { name?: string; email?: string; passwordHash?: string } = {};

    // 1. Update Name if provided and changed
    if (name && name.trim() !== admin!.name) {
      updateData.name = name.trim();
    }

    // 2. Handle Email Update with OTP validation
    if (email && email.trim() !== admin!.email) {
      const newEmail = email.trim();

      if (!otpCode) {
        return NextResponse.json(
          { success: false, error: "OTP code is required to verify the new email address" },
          { status: 400 }
        );
      }

      // Fetch OTP from database
      const otpRecord = await db.adminOTP.findUnique({
        where: { email: newEmail },
      });

      if (!otpRecord || otpRecord.code !== otpCode.trim() || otpRecord.expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired OTP code" },
          { status: 400 }
        );
      }

      updateData.email = newEmail;
    }

    // 3. Handle Password Update
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required to change password" },
          { status: 400 }
        );
      }

      const isValidPassword = await verifyPassword(currentPassword, admin!.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: "Incorrect current password" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 8 characters long" },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    // Check if we actually have any modifications to perform
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: "Profile is already up to date.",
      });
    }

    // Update in database
    const updatedAdmin = await db.adminUser.update({
      where: { id: admin!.id },
      data: updateData,
    });

    // Clean up OTP record if email was successfully updated
    if (updateData.email) {
      await db.adminOTP.delete({ where: { email: updateData.email } }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Admin profile updated successfully!",
      data: {
        name: updatedAdmin.name,
        email: updatedAdmin.email,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/profile/update error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
