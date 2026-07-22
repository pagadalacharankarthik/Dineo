import nodemailer from "nodemailer";

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: SendMailParams) => {
  // If SMTP is not configured, just log it out (development mode fallback)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP not configured! Mocking email delivery to:", to);
    console.warn("Subject:", subject);
    console.warn("Body length:", html.length);
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM || `"Dineo Support" <${process.env.SMTP_USER}>`;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
