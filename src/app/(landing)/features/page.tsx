import type { Metadata } from "next";
import Link from "next/link";
import {
  QrCode, Zap, Smartphone, BarChart3, Globe, Shield,
  Palette, Clock, Bell, Users, Tag, ImageIcon, ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore all features of Dineo — QR code generation, real-time menu updates, analytics, and more.",
};

const allFeatures = [
  { icon: QrCode, title: "QR Code Generation", description: "Generate unique, branded QR codes for each table or your entire restaurant. Customize with your logo.", category: "Core" },
  { icon: Zap, title: "Instant Updates", description: "Changes to your menu go live immediately. No reprinting. No delays. Update prices, items, and availability in seconds.", category: "Core" },
  { icon: Smartphone, title: "Mobile-First Menus", description: "Pixel-perfect menus that load instantly on any smartphone. No app download required for customers.", category: "Core" },
  { icon: BarChart3, title: "Analytics Dashboard", description: "View scan counts, popular items, peak hours, and customer engagement metrics.", category: "Analytics" },
  { icon: Globe, title: "Multi-language Support", description: "Serve international customers with menus in multiple languages. Coming soon.", category: "Advanced" },
  { icon: Shield, title: "Enterprise Security", description: "Bank-grade encryption, secure sessions, HTTPS everywhere. Your data is always protected.", category: "Security" },
  { icon: Palette, title: "Brand Customization", description: "Upload your logo, set your brand colors, add a cover image. Make the menu feel like your restaurant.", category: "Customization" },
  { icon: Clock, title: "Operating Hours", description: "Display your restaurant's opening and closing times on the menu.", category: "Core" },
  { icon: Bell, title: "Availability Control", description: "Mark items as available or sold out in real-time. Customers always see accurate information.", category: "Core" },
  { icon: Users, title: "Staff Management", description: "Manage staff roles and permissions. Coming in Phase 2.", category: "Advanced" },
  { icon: Tag, title: "Category Management", description: "Organize your menu into categories like Starters, Mains, Desserts, Drinks. Easy and intuitive.", category: "Core" },
  { icon: ImageIcon, title: "Item Photos", description: "Add high-quality photos to your menu items. Beautiful presentation drives more orders.", category: "Core" },
];

const categories = ["All", "Core", "Analytics", "Customization", "Advanced", "Security"];

export default function FeaturesPage() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
            Powerful features for{" "}
            <span className="gradient-text">modern restaurants</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, manage, and share a beautiful digital
            menu. Built for restaurant owners, designed for customers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-orange-500 bg-orange-50 dark:bg-orange-950/30 rounded-full px-2 py-0.5">
                  {feature.category}
                </span>
                <h3 className="font-semibold text-lg mt-3 mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to experience all these features?
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 gradient-primary text-white font-semibold rounded-xl px-8 py-3.5 hover:opacity-90 transition-all hover:scale-105"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
