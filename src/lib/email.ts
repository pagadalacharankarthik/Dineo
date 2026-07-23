import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: SendMailParams) => {
  // If SMTP is not configured, write email to a mock file for local developer preview
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP not configured! Mocking email delivery to:", to);
    console.warn("Subject:", subject);
    console.warn("Body length:", html.length);

    try {
      const mockDir = path.join(process.cwd(), "public", "mock-emails");
      if (!fs.existsSync(mockDir)) {
        fs.mkdirSync(mockDir, { recursive: true });
      }
      const mockPath = path.join(mockDir, "latest-email.html");
      
      // Wrap it in a simple document to show the metadata
      const previewHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Mock Email Preview</title>
          <style>
            .email-header {
              background-color: #f1f5f9;
              border-bottom: 1px solid #cbd5e1;
              padding: 12px 20px;
              font-family: monospace;
              font-size: 13px;
              color: #475569;
              margin-bottom: 20px;
              border-radius: 8px 8px 0 0;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            .email-body {
              padding: 0 20px 20px 20px;
            }
          </style>
        </head>
        <body style="background-color: #f8fafc; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div class="email-container">
            <div class="email-header">
              <strong>To:</strong> ${to}<br/>
              <strong>Subject:</strong> ${subject}<br/>
              <strong>Sent At:</strong> ${new Date().toLocaleString()}<br/>
              <strong>Status:</strong> Mocked (SMTP Not Configured)
            </div>
            <div class="email-body">
              ${html}
            </div>
          </div>
        </body>
        </html>
      `;
      
      fs.writeFileSync(mockPath, previewHtml, "utf-8");
      console.warn("📝 Mock email saved to public/mock-emails/latest-email.html");
      console.warn("🔗 Preview it at http://localhost:3000/mock-emails/latest-email.html");
    } catch (err) {
      console.error("Failed to write mock email file:", err);
    }

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
