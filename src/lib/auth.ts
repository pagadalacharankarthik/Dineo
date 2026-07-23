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
    requireEmailVerification: true, // Requires email verification before login is allowed
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 24px; font-weight: 800; color: #ea580c; tracking: -0.05em; display: inline-flex; align-items: center; gap: 4px;">
              ⚡ Dineo
            </span>
          </div>
          <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700; text-align: center;">Security: Password Reset Request</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 15px;">Hi ${user.name},</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">You requested a password reset for your Dineo merchant account. Click the button below to secure your account and set a new password:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${url}" style="display: inline-block; padding: 12px 28px; background-color: #ea580c; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.2); transition: opacity 0.2s;">Reset Password</a>
          </div>
          
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 20px;">If you did not request a password reset, please ignore this security message. Your account remains secure.</p>
          
          <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5;">
            © ${new Date().getFullYear()} Dineo. All rights reserved.<br/>
            Support: <a href="mailto:charanlabssupport@gmail.com" style="color: #ea580c; text-decoration: none;">charanlabssupport@gmail.com</a>
          </div>
        </div>
      `;
      await sendMail({
        to: user.email,
        subject: "Dineo Security - Reset your password",
        html,
      });
    },
    sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 24px; font-weight: 800; color: #ea580c; display: inline-flex; align-items: center; gap: 4px;">
              ⚡ Dineo
            </span>
          </div>
          <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700; text-align: center;">Verify Your Account Email</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 15px;">Hi ${user.name},</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for registering on Dineo! Click the verification button below to activate your restaurant menu management dashboard:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${url}" style="display: inline-block; padding: 12px 28px; background-color: #ea580c; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.2);">Verify Email Address</a>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5;">
            © ${new Date().getFullYear()} Dineo. All rights reserved.<br/>
            Support: <a href="mailto:charanlabssupport@gmail.com" style="color: #ea580c; text-decoration: none;">charanlabssupport@gmail.com</a>
          </div>
        </div>
      `;
      await sendMail({
        to: user.email,
        subject: "Dineo Onboarding - Verify your email",
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
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 24px; font-weight: 800; color: #ea580c; display: inline-flex; align-items: center; gap: 4px;">
                  ⚡ Dineo
                </span>
              </div>
              <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700; text-align: center;">Security Alert: Password Changed</h2>
              
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                Hi ${user.name},
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                This email confirms that the password for your Dineo account (<strong>${user.email}</strong>) has been changed successfully.
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                If you made this change, you don't need to take any action. If you did not authorize this request, please contact our support team immediately to lock and secure your account.
              </p>
              
              <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5;">
                © ${new Date().getFullYear()} Dineo. All rights reserved.<br/>
                Support: <a href="mailto:charanlabssupport@gmail.com" style="color: #ea580c; text-decoration: none;">charanlabssupport@gmail.com</a>
              </div>
            </div>
          `;
          await sendMail({
            to: user.email,
            subject: "Dineo Security - Your password was changed",
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
