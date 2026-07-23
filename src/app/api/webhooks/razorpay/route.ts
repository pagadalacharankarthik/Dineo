import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Webhook secret not configured.");
      return NextResponse.json({ success: false, error: "Webhook secret missing" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing signature" }, { status: 400 });
    }

    // Verify the signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    
    // Handle the events
    if (event === "subscription.charged") {
      const subscriptionId = payload.payload.subscription.entity.id;
      const customerId = payload.payload.subscription.entity.customer_id;

      // Find the restaurant that matches this subscription
      const restaurant = await db.restaurant.findUnique({
        where: { razorpaySubscriptionId: subscriptionId }
      });

      if (restaurant) {
        // Upgrade them to PRO and extend expiry by 30 days
        const nextBillingDate = new Date();
        nextBillingDate.setDate(nextBillingDate.getDate() + 30);

        await db.restaurant.update({
          where: { id: restaurant.id },
          data: {
            planName: "PRO",
            planStatus: "ACTIVE",
            planExpiresAt: nextBillingDate,
            razorpayCustomerId: customerId
          }
        });
        console.log(`Successfully upgraded restaurant ${restaurant.id} to PRO via Razorpay.`);
      }
    } else if (event === "subscription.halted" || event === "subscription.cancelled") {
      const subscriptionId = payload.payload.subscription.entity.id;
      
      const restaurant = await db.restaurant.findUnique({
        where: { razorpaySubscriptionId: subscriptionId }
      });

      if (restaurant) {
        // Revert them back to FREE_TRIAL if the subscription stops
        await db.restaurant.update({
          where: { id: restaurant.id },
          data: {
            planName: "FREE_TRIAL",
            planStatus: "HALTED",
          }
        });
        console.log(`Downgraded restaurant ${restaurant.id} due to halted/cancelled subscription.`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
