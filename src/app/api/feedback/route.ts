import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { sendMail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { restaurant, errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { rating, type, message } = body;

    if (!rating || !type || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailSubject = `Dineo Beta Feedback: [${type}] from ${restaurant.name}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 8px;">Dineo Beta Feedback Report</h2>
        <p style="font-size: 14px; color: #475569;">A merchant has submitted beta feedback after experiencing the system.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Restaurant:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${restaurant.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Owner Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${restaurant.email || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Feedback Type:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #0f172a;"><span style="background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; color: #334155;">${type}</span></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Rating:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #eab308; font-size: 18px;">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)</td>
          </tr>
        </table>

        <div style="background-color: #f8fafc; border-left: 4px solid #ea580c; padding: 16px; border-radius: 4px; margin-top: 10px;">
          <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Message:</h4>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="font-size: 11px; color: #94a3b8; margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          Dineo Beta Feedback System • Generated automatically
        </p>
      </div>
    `;

    // Send email directly to support
    await sendMail({
      to: "charanlabssupport@gmail.com",
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
