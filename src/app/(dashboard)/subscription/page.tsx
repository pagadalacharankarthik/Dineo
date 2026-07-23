"use client";

import { useState, useEffect } from "react";
import { Sparkles, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import Script from "next/script";
import { toast } from "sonner";

// Extend Window object for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [currentPlan, setCurrentPlan] = useState<string>("FREE_TRIAL");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/restaurant")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.planName) {
            setCurrentPlan(data.data.planName);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching restaurant:", err);
          setLoading(false);
        });
    }
  }, [session]);

  const handleUpgrade = async (planName: string) => {
    // Safeguard: Check if Razorpay keys are configured
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const planId = process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID_PRO;

    if (!keyId || !planId) {
      toast.info(
        "Payment Gateway Coming Soon! Please contact support to upgrade manually.",
        { 
          duration: 8000,
          action: {
            label: "Contact Support",
            onClick: () => {
              window.location.href = "/contact";
            }
          }
        }
      );
      return;
    }

    if (planName !== "Professional") {
      toast.info("Enterprise plans require custom setup. Please contact support.");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Call our new backend route to create a subscription
      const res = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.error || "Failed to initiate payment");
        setIsProcessing(false);
        return;
      }

      // Initialize Razorpay Modal
      const options = {
        key: keyId,
        subscription_id: data.subscriptionId,
        name: "Dineo SaaS",
        description: "Professional Tier Subscription",
        image: "/logo.svg",
        handler: function (response: any) {
          toast.success("Payment Successful! Your account is being upgraded...");
          // In a real scenario, you'd wait a few seconds for the webhook to fire, then refresh
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#f97316", // Primary orange
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
      
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const mapPlanName = (dbPlan: string) => {
    if (dbPlan === "PRO") return "Professional";
    if (dbPlan === "EARLY_ADOPTER") return "Early Adopter";
    if (dbPlan === "ENTERPRISE") return "Enterprise";
    return "Starter";
  };

  const activePlanName = mapPlanName(currentPlan);

  const plans = [
    {
      name: "Starter",
      price: "₹0/mo",
      description: "Perfect for small restaurants getting a taste of Dineo",
      features: ["1 Permanent QR Code", "Up to 5 Categories", "Up to 25 Menu Items", "1 Promo Code limit", "Basic PNG Poster"],
      highlighted: false,
    },
    {
      name: "Professional",
      price: "₹499/mo",
      description: "For growing restaurants that want a premium brand",
      features: ["Unlimited Categories", "Unlimited Menu Items", "Unlimited Promo Codes", "SVG Vector QR Code", "Custom Logo in QR", "All Poster Colors"],
      highlighted: true,
    },
    {
      name: "Early Adopter",
      price: "Invite Only",
      description: "Exclusive plan for our first 10 foundational members",
      features: ["Up to 10 Categories", "Up to 50 Menu Items", "Unlimited Promo Codes", "SVG Vector QR Code", "Custom Logo in QR", "All Poster Colors"],
      highlighted: false,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Subscription & Billing</h1>
        <p className="text-muted-foreground">Manage your plan and explore premium features.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isActive = activePlanName === plan.name;
          
          return (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl border ${
                isActive 
                  ? "border-primary shadow-lg shadow-primary/10 bg-primary/5" 
                  : plan.highlighted
                  ? "border-orange-500 shadow-xl shadow-orange-500/20 bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10"
                  : "border-border bg-card"
              } flex flex-col`}
            >
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="gradient-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Check className="h-3 w-3" /> Current Plan
                  </span>
                </div>
              )}
              {!isActive && plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="gradient-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    Recommended
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
              <ul className="space-y-3 mb-8 text-left flex-grow">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <div className="h-5 w-5 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              
              {isActive ? (
                <button
                  disabled
                  className="w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all border border-primary text-primary opacity-70"
                >
                  Active Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={isProcessing}
                  className={`block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlighted
                      ? "gradient-primary text-white hover:opacity-90"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {isProcessing && plan.highlighted ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </span>
                  ) : (
                    "Upgrade to " + plan.name
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
