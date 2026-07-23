import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true when SMTP is configured
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      const html = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; text-align: center;">
          <h2 style="color: #0f172a;">Password Reset</h2>
          <p>Hi ${user.name}, you requested a password reset. Click the button below to reset it:</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Reset Password</a>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">If you didn't request this, ignore this email.</p>
        </div>
      `;
      await sendMail({
        to: user.email,
        subject: "Dineo - Reset your password",
        html,
      });
    },
    sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
      const html = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; text-align: center;">
          <h2 style="color: #0f172a;">Verify Your Email</h2>
          <p>Hi ${user.name}, welcome to Dineo! Click the button below to verify your email address:</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Verify Email</a>
        </div>
      `;
      await sendMail({
        to: user.email,
        subject: "Dineo - Verify your email",
        html,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes
    },
  },
  user: {
    additionalFields: {
      mobile: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  events: {
    password: {
      changed: async ({ user }: { user: any }) => {
        try {
          const html = `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); text-align: center;">
              <h2 style="color: #ea580c; margin-top: 0; margin-bottom: 8px;">Dineo Account Alert</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 0;">Password Changed Successfully</p>
              
              <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: left; margin-top: 20px;">
                Hi ${user.name},<br/><br/>
                This is a confirmation that the password for your Dineo merchant account (<strong>${user.email}</strong>) has been changed successfully.<br/><br/>
                If you made this change, you don't need to do anything. If you did not make this change, please contact support immediately to secure your account.
              </p>
              
              <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px;">This is an automated security notification. Please do not reply directly to this email.</p>
            </div>
          `;
          await sendMail({
            to: user.email,
            subject: "Dineo - Your password was changed",
            html,
          });
        } catch (error) {
          console.error("Failed to send password changed email:", error);
        }
      }
    }
  }
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
