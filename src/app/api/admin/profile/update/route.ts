import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, verifyPassword, hashPassword } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/email";

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

    // Send security alert email if password was changed
    if (updateData.passwordHash) {
      const html = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); text-align: center;">
          <h2 style="color: #ea580c; margin-top: 0; margin-bottom: 8px;">Dineo Admin Alert</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Super Admin Password Changed Successfully</p>
          
          <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: left; margin-top: 20px;">
            Hi ${updatedAdmin.name},<br/><br/>
            This is a confirmation that the password for your Dineo Super Admin account (<strong>${updatedAdmin.email}</strong>) has been changed successfully.<br/><br/>
            If you made this change, you don't need to do anything. If you did not make this change, please contact support immediately to secure your admin account.
          </p>
          
          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px;">This is an automated security notification. Please do not reply directly to this email.</p>
        </div>
      `;
      await sendMail({
        to: updatedAdmin.email,
        subject: "Dineo Admin - Your password was changed",
        html,
      }).catch(err => console.error("Failed to send admin password change notification:", err));
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
