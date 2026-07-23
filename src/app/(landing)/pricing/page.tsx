import type { Metadata } from "next";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Dineo. Free plan available.",
};

export default async function PricingPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  
  const isAuthenticated = !!session?.user;
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 gradient-primary text-white rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <Sparkles className="h-4 w-4" />
          Flexible Pricing Plans
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
          Simple, transparent <span className="gradient-text">pricing</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-12">
          We are working on our pricing plans. Sign up now and get early access
          with{" "}
          <strong className="text-foreground">free premium features</strong>{" "}
          during our launch period.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            {
              name: "Starter",
              price: "₹0/mo",
              description: "Perfect for small restaurants getting a taste of Dineo",
              features: ["1 Permanent QR Code", "Up to 5 Categories", "Up to 25 Menu Items", "1 Promo Code limit", "Basic PNG Poster"],
              cta: "Get Started",
              highlighted: false,
            },
            {
              name: "Professional",
              price: "₹499/mo",
              description: "For growing restaurants that want a premium brand",
              features: ["Unlimited Categories", "Unlimited Menu Items", "Unlimited Promo Codes", "SVG Vector QR Code", "Custom Logo in QR", "All Poster Colors"],
              cta: "Get Pro Access",
              highlighted: true,
            },
            {
              name: "Early Adopter",
              price: "Invite Only",
              description: "Exclusive plan for our first 10 foundational members",
              features: ["Up to 10 Categories", "Up to 50 Menu Items", "Unlimited Promo Codes", "SVG Vector QR Code", "Custom Logo in QR", "All Poster Colors"],
              cta: "Contact Us",
              highlighted: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl border ${
                plan.highlighted
                  ? "border-orange-500 shadow-xl shadow-orange-500/20 bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="gradient-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
              <p className="text-3xl font-extrabold gradient-text mb-2">
                {plan.price}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {plan.description}
              </p>
              <ul className="space-y-2 mb-8 text-left">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4 rounded-full gradient-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={
                  isAuthenticated
                    ? "/contact"
                    : plan.name === "Enterprise"
                    ? "/contact"
                    : "/register"
                }
                className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? "gradient-primary text-white hover:opacity-90"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {isAuthenticated ? "Upgrade via Support" : plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Questions about pricing?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
