import type { Metadata } from "next";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Dineo. Free plan available.",
};

export default function PricingPage() {
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
              description: "Perfect for small restaurants getting started",
              features: ["1 QR Code", "Up to 50 menu items", "Basic analytics", "Email support"],
              cta: "Get Started",
              highlighted: false,
            },
            {
              name: "Professional",
              price: "₹999/mo",
              description: "For growing restaurants with advanced needs",
              features: ["Unlimited QR Codes", "Unlimited menu items", "Advanced analytics", "Priority support", "Custom branding", "Custom menu styles"],
              cta: "Get Pro Access",
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "₹2,999/mo",
              description: "For restaurant chains and large operations",
              features: ["Everything in Pro", "Multiple locations", "Staff management", "Dedicated support", "Custom integrations"],
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
                href={plan.name === "Enterprise" ? "/contact" : "/register"}
                className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? "gradient-primary text-white hover:opacity-90"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {plan.cta}
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
