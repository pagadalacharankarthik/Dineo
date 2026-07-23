"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as QRCodeLib from "qrcode";
import {
  QrCode,
  Smartphone,
  Zap,
  BarChart3,
  Globe,
  Shield,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronDown,
  UserPlus,
  LayoutList,
  ScanLine,
  Sparkles,
  ChevronRight,
  Mail,
  MessageCircle,
  Send,
  Loader2,
  X,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const features = [
  {
    icon: QrCode,
    title: "Instant QR Menus",
    description:
      "Generate unique QR codes for your restaurant tables. Customers scan and view your menu instantly on their phones.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description:
      "Update your menu anytime — prices, items, availability — changes reflect instantly without reprinting anything.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description:
      "Beautiful, fast-loading menus that look great on every device. Zero app installation required for customers.",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: BarChart3,
    title: "Scan Analytics",
    description:
      "Track how many times your QR code is scanned, which items are most viewed, and peak dining hours.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Globe,
    title: "Multi-language Ready",
    description:
      "Serve international customers with multilingual menu support. Break language barriers effortlessly.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Your data is protected with bank-grade encryption, secure sessions, and regular backups.",
    color: "from-teal-500 to-cyan-500",
  },
];

const howItWorks = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in under 2 minutes with your restaurant name and email. No credit card, no commitment — free forever plan included.",
    highlight: "Free signup",
    color: "from-orange-500 to-amber-500",
    details: [
      "No credit card required",
      "Free plan available",
      "Takes less than 2 minutes",
    ],
  },
  {
    step: "02",
    icon: LayoutList,
    title: "Build Your Digital Menu",
    description:
      "Add your categories, menu items, prices, descriptions and mouth-watering photos. Organise your menu exactly the way you want it.",
    highlight: "Unlimited items",
    color: "from-blue-500 to-cyan-500",
    details: [
      "Unlimited categories & items",
      "Add photos to every dish",
      "Set prices, tags & availability",
    ],
  },
  {
    step: "03",
    icon: QrCode,
    title: "Generate Your QR Code",
    description:
      "One click gives you a unique, branded QR code for your restaurant. Download and print it — place it on tables, at the door, or online.",
    highlight: "Branded QR code",
    color: "from-purple-500 to-violet-500",
    details: [
      "Download as PNG or PDF",
      "Place on tables, walls & receipts",
      "Shareable digital link too",
    ],
  },
  {
    step: "04",
    icon: ScanLine,
    title: "Customers Scan & Explore",
    description:
      "Customers point their phone camera at the QR code — your beautiful digital menu loads instantly in their browser. No app, no friction.",
    highlight: "Zero app install",
    color: "from-green-500 to-emerald-500",
    details: [
      "Works with any phone camera",
      "Blazing fast load time",
      "Beautiful on every screen",
    ],
  },
];

const faqs = [
  {
    q: "Do customers need to download an app?",
    a: "No! Customers simply scan your QR code with their phone camera and the menu opens instantly in their browser. No app installation needed.",
  },
  {
    q: "Can I update my menu in real-time?",
    a: "Absolutely! Any changes you make to your menu are reflected instantly. No reprinting, no delays.",
  },
  {
    q: "How many menu items can I add?",
    a: "You can add unlimited categories and menu items on all plans. We don't restrict your creativity.",
  },
  {
    q: "Is it free to get started?",
    a: "Yes! We offer a free plan to get you started. You can upgrade as your restaurant grows.",
  },
  {
    q: "Can I customize the menu design?",
    a: "Yes! You can add your restaurant logo, cover image, colors, and customize the look to match your brand.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use enterprise-grade security with encrypted connections, secure sessions, and regular backups.",
  },
];

const starterKits = [
  {
    name: "Acrylic QR Stand",
    desc: "Sleek L-shaped tabletop display.",
    gradient: "from-orange-400 to-amber-500",
  },
  {
    name: "Waterproof Sticker",
    desc: "Heavy-duty outdoor tabletop sticker.",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    name: "Counter Display",
    desc: "Chunky dual-sided checkout stand.",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    name: "Window Sticker",
    desc: "Front-adhesive window cling sticker.",
    gradient: "from-teal-400 to-emerald-500",
  },
];

export default function HomePage() {
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedKit, setSelectedKit] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactRestName, setContactRestName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [submittingContact, setSubmittingContact] = useState(false);

  // Interest Form State
  const [interestRestName, setInterestRestName] = useState("");
  const [interestPerson, setInterestPerson] = useState("");
  const [interestEmail, setInterestEmail] = useState("");
  const [interestPhone, setInterestPhone] = useState("");
  const [interestAddress, setInterestAddress] = useState("");
  const [interestCity, setInterestCity] = useState("");
  const [interestState, setInterestState] = useState("");
  const [interestPincode, setInterestPincode] = useState("");
  const [interestTables, setInterestTables] = useState(10);
  const [interestQty, setInterestQty] = useState(10);
  const [interestQrColor, setInterestQrColor] = useState("orange");
  const [submittingInterest, setSubmittingInterest] = useState(false);

  const colorOptions = {
    orange: { gradient: "from-orange-500 via-amber-500 to-amber-600", hex: "#ea580c" },
    black: { gradient: "from-zinc-800 via-neutral-900 to-black", hex: "#000000" },
    blue: { gradient: "from-blue-500 via-cyan-500 to-blue-600", hex: "#2563eb" },
    purple: { gradient: "from-purple-500 via-violet-500 to-purple-600", hex: "#7c3aed" },
    dark: { gradient: "from-slate-800 via-slate-900 to-black", hex: "#0f172a" },
    emerald: { gradient: "from-emerald-500 via-teal-500 to-emerald-600", hex: "#059669" },
    rose: { gradient: "from-rose-500 via-pink-500 to-rose-600", hex: "#e11d48" },
    gold: { gradient: "from-amber-400 via-yellow-500 to-amber-600", hex: "#d97706" },
    red: { gradient: "from-red-500 via-rose-600 to-red-650", hex: "#dc2626" },
  };

  useEffect(() => {
    // Generate static high-contrast data URL for QR Code menu demo
    if (typeof window !== "undefined") {
      const targetUrl = `${window.location.origin}/menu/demo`;
      QRCodeLib.toDataURL(targetUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: "#000000", // pure black for max scanner compatibility
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingContact(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          restaurantName: contactRestName,
          email: contactEmail,
          phone: contactPhone,
          message: contactMsg,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Message sent successfully! We will get back to you shortly.");
        setContactName("");
        setContactRestName("");
        setContactEmail("");
        setContactPhone("");
        setContactMsg("");
      } else {
        toast.error(data.error || "Failed to send enquiry.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInterest(true);
    try {
      const res = await fetch("/api/qr-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: interestRestName,
          contactPerson: interestPerson,
          email: interestEmail,
          phone: interestPhone,
          address: interestAddress,
          city: interestCity,
          state: interestState,
          pincode: interestPincode,
          tableCount: Number(interestTables),
          quantityNeeded: Number(interestQty),
          qrColor: interestQrColor,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Interest logged successfully! We will contact you once kits are available.");
        setInterestRestName("");
        setInterestPerson("");
        setInterestEmail("");
        setInterestPhone("");
        setInterestAddress("");
        setInterestCity("");
        setInterestState("");
        setInterestPincode("");
        setNotifyModalOpen(false);
      } else {
        toast.error(data.error || "Failed to log interest.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmittingInterest(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/20 dark:via-amber-950/10 dark:to-background" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-200/30 dark:bg-amber-900/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Star className="h-3.5 w-3.5 fill-current" />
            Trusted by 500+ restaurants across India
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Replace Printed Menus{" "}
            <br className="hidden sm:block" />
            with{" "}
            <span className="gradient-text">Smart QR Menus</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Create, manage, and update your restaurant menu instantly without
            reprinting menu cards. Save money, save time, delight customers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 gradient-primary text-white font-semibold rounded-xl px-8 py-3.5 text-base shadow-lg hover:opacity-90 transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-background border border-border rounded-xl px-8 py-3.5 text-base font-semibold hover:bg-muted transition-colors"
            >
              Login to Dashboard
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {[
              "No credit card required",
              "Free plan available",
              "Setup in 5 minutes",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE MENU PREVIEW ─── */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-orange-50/50 to-white dark:from-zinc-950/20 dark:to-background border-y border-border/50 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />

            {/* Left Copy Column */}
            <div className="space-y-6 flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" /> Interactive Experience
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                Scan QR. View Menu. <br/>
                Order Instantly.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto md:mx-0">
                Check out how your restaurant menu will look to your customers. Browse dishes, check categories, search items, and experience the checkout cart!
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
                <a
                  href="/menu/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Menu Preview in Browser
                </a>
              </div>

              {/* Bouncing Arrow Down indicator pointing to QR Code section */}
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-muted-foreground font-semibold pt-4 animate-bounce">
                <span>Scan the QR code below</span>
                <ChevronDown className="h-4 w-4 text-primary animate-pulse" />
              </div>
            </div>

            {/* Right Phone Mockup Column */}
            <div className="relative flex justify-center items-center max-w-[270px] w-full mx-auto md:mx-0 animate-in slide-in-from-bottom duration-700">
              {/* Device Outer Frame */}
              <div className="relative border-[6px] border-zinc-800 dark:border-zinc-700 bg-zinc-900 rounded-[2.5rem] p-2.5 shadow-2xl w-full h-[470px] flex flex-col overflow-hidden">
                {/* Speaker/Camera notch */}
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-zinc-900 rounded-full z-20 flex items-center justify-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  <div className="w-8 h-1 bg-zinc-700 rounded-full" />
                </div>
                
                {/* Phone screen content */}
                <div className="bg-zinc-50 dark:bg-zinc-950 flex-1 rounded-[2rem] overflow-hidden flex flex-col relative text-zinc-900 dark:text-zinc-100 text-left select-none pt-2.5">
                  {/* Restaurant Banner Header */}
                  <div className="relative h-20 bg-cover bg-center flex items-end p-3" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80')` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="relative z-10 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-base border border-white/20">
                        🍕
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-white leading-tight">Spicy Pepper Bistro</h4>
                        <p className="text-[7px] text-white/80">Table 04 • Multi-cuisine</p>
                      </div>
                    </div>
                  </div>

                  {/* Categories Tags Bar */}
                  <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b border-border bg-card scrollbar-none">
                    <span className="text-[7px] font-black uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full whitespace-nowrap">🔥 Best Sellers</span>
                    <span className="text-[7px] font-black uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">🍔 Burgers</span>
                    <span className="text-[7px] font-black uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">🍕 Pizza</span>
                  </div>

                  {/* Menu Items List */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-muted/20">
                    <div className="p-2 bg-card rounded-xl border border-border flex items-center justify-between gap-2 shadow-xs">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h5 className="text-[9px] font-black truncate">Classic Cheeseburger</h5>
                        <p className="text-[7px] text-muted-foreground line-clamp-1">Crispy patty, melting cheddar, pickles...</p>
                        <span className="text-[9px] font-black text-primary">₹149</span>
                      </div>
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80')` }}>
                        <div className="absolute inset-0 bg-black/10" />
                        <button className="absolute bottom-0.5 right-0.5 bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-xs pointer-events-none">+ Add</button>
                      </div>
                    </div>

                    <div className="p-2 bg-card rounded-xl border border-border flex items-center justify-between gap-2 shadow-xs">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h5 className="text-[9px] font-black truncate">Spicy Paneer Pizza</h5>
                        <p className="text-[7px] text-muted-foreground line-clamp-1">Wood-fired thin crust, spiced paneer...</p>
                        <span className="text-[9px] font-black text-primary">₹299</span>
                      </div>
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80')` }}>
                        <div className="absolute inset-0 bg-black/10" />
                        <button className="absolute bottom-0.5 right-0.5 bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-xs pointer-events-none">+ Add</button>
                      </div>
                    </div>

                    <div className="p-2 bg-card rounded-xl border border-border flex items-center justify-between gap-2 shadow-xs">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h5 className="text-[9px] font-black truncate">Fresh Mint Mojito</h5>
                        <p className="text-[7px] text-muted-foreground line-clamp-1">Refreshing lime, mint, sparkling soda...</p>
                        <span className="text-[9px] font-black text-primary">₹99</span>
                      </div>
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=150&q=80')` }}>
                        <div className="absolute inset-0 bg-black/10" />
                        <button className="absolute bottom-0.5 right-0.5 bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-xs pointer-events-none">+ Add</button>
                      </div>
                    </div>
                  </div>

                  {/* Floating View Cart bar */}
                  <div className="p-2 bg-primary text-white text-[8px] font-black flex items-center justify-between shadow-lg mx-2 mb-2 rounded-xl border border-white/10">
                    <span>🛒 1 Item Added</span>
                    <span>View Cart &rarr;</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">go digital</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete digital menu platform built specifically for modern
              restaurants.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-4`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── PHYSICAL STARTER KITS ─── */}
      <section className="py-20 sm:py-28 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <ShoppingBag className="h-4 w-4" /> Physical QR Stands
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Restaurant <span className="gradient-text">Starter Kits</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get professionally printed, waterproof acrylic stands and window stickers for your dining tables.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {starterKits.map((kit) => (
              <div
                key={kit.name}
                className="overflow-hidden rounded-2xl border border-border bg-card p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className={`h-36 bg-gradient-to-tr ${kit.gradient} rounded-xl flex items-center justify-center text-white mb-4 relative`}>
                  <div className="absolute top-2 right-2 bg-black/35 backdrop-blur-xs text-[9px] uppercase tracking-wider font-bold text-white px-2 py-0.5 rounded">
                    Preview
                  </div>
                  <QrCode className="h-12 w-12 opacity-40 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-snug">{kit.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{kit.desc}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedKit(kit.name);
                    setNotifyModalOpen(true);
                  }}
                  className="w-full mt-4 text-xs font-bold py-2 px-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
                >
                  Notify Me When Available
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/60 via-background to-muted/30" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Simple. Fast. Powerful.
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-5">
              Up and running in{" "}
              <span className="gradient-text">4 simple steps</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No technical knowledge required. Go from zero to a digital menu in under 10 minutes.
            </p>
          </div>

          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="group relative rounded-3xl border border-border bg-card p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 text-[120px] font-black text-muted/20 leading-none select-none pointer-events-none">
                    {item.step}
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-lg`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {item.highlight}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                          STEP {item.step}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {item.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <div className={`flex-shrink-0 h-4 w-4 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                            <ChevronRight className="h-2.5 w-2.5 text-white" />
                          </div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Why restaurants choose{" "}
                <span className="gradient-text">Dineo</span>
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Save printing costs",
                    desc: "Eliminate recurring menu printing costs. Update as often as you need.",
                  },
                  {
                    title: "Hygienic dining experience",
                    desc: "No physical menus to touch. Customers scan safely with their own devices.",
                  },
                  {
                    title: "Reduce errors",
                    desc: "Instant price and availability updates eliminate menu confusion.",
                  },
                  {
                    title: "Increase revenue",
                    desc: "Beautiful photos and descriptions encourage customers to order more.",
                  },
                  {
                    title: "24/7 management",
                    desc: "Manage your menu from anywhere, any time, on any device.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full gradient-primary flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="w-full max-w-sm mx-auto rounded-3xl gradient-primary p-1 shadow-2xl">
                <div className="rounded-[22px] bg-background flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-white p-4 rounded-2xl shadow-md border border-border flex items-center justify-center mb-4">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-white rounded-xl overflow-hidden">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Menu" className="w-full h-full object-contain" />
                      ) : (
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-1 rounded-xl shadow-md border border-zinc-100 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
                          <img src="/logo.svg" alt="Dineo Logo" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground">Scan Live QR Menu 📸</p>
                    <p className="text-xs text-muted-foreground mt-1 px-4">
                      Scan this high-contrast QR code with your phone to open the digital restaurant menu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT FORM SECTION ─── */}
      <section id="contact" className="py-20 sm:py-28 bg-muted/40 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Have questions about QR menus or starter kits? Send us a message and our team will get back to you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick contact info */}
            <div className="space-y-4 md:col-span-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-xs">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Us</p>
                  <p className="text-xs font-semibold truncate mt-0.5">charanlabssupport@gmail.com</p>
                </div>
              </div>

              <a
                href="https://wa.me/919912551260"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-xs hover:border-primary/30 transition-all"
              >
                <MessageCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">WhatsApp Support</p>
                  <p className="text-xs font-semibold truncate mt-0.5">+91 99125 51260</p>
                </div>
              </a>
            </div>

            {/* Actual Form */}
            <div className="md:col-span-2 p-6 md:p-8 bg-card border border-border rounded-3xl shadow-xs">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Restaurant Name (Optional)</label>
                    <input
                      type="text"
                      value={contactRestName}
                      onChange={(e) => setContactRestName(e.target.value)}
                      placeholder="e.g. Spice Route"
                      className="w-full text-xs font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="rahul@spiceroute.com"
                      className="w-full text-xs font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. 9912551260"
                      className="w-full text-xs font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Your Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Tell us what you need help with or any questions you have..."
                    className="w-full text-xs font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingContact}
                  className="w-full inline-flex items-center justify-center gap-2 gradient-primary text-white font-bold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-xs"
                >
                  {submittingContact ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-card p-6 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-sm list-none">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 sm:py-28 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-6">
            Ready to go <span className="gradient-text">digital</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join hundreds of restaurants already using Dineo to delight their
            customers and save on printing costs.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 gradient-primary text-white font-bold rounded-xl px-10 py-4 text-base shadow-xl hover:opacity-90 transition-all hover:scale-105"
          >
            Start for Free Today
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · Free forever plan available
          </p>
        </div>
      </section>

      {/* ─── NOTIFY MODAL / INTEREST FORM ─── */}
      {notifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl animate-in scale-in duration-250 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setNotifyModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold flex items-center gap-1.5 mb-2">
              <ShoppingBag className="h-5 w-5 text-primary animate-pulse" /> Kit Availability Notification
            </h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Expressed interest in: <span className="font-bold text-foreground">{selectedKit}</span>.
              Fill out this pre-order notification request. We will contact you once printed kits are ready to ship!
            </p>

            <form onSubmit={handleInterestSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Restaurant Name</label>
                  <input
                    type="text"
                    required
                    value={interestRestName}
                    onChange={(e) => setInterestRestName(e.target.value)}
                    placeholder="e.g. Spice Route Cafe"
                    className="w-full text-xs font-semibold px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={interestPerson}
                    onChange={(e) => setInterestPerson(e.target.value)}
                    placeholder="Your Name"
                    className="w-full text-xs font-semibold px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    value={interestEmail}
                    onChange={(e) => setInterestEmail(e.target.value)}
                    placeholder="manager@spiceroute.com"
                    className="w-full text-xs font-semibold px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={interestPhone}
                    onChange={(e) => setInterestPhone(e.target.value)}
                    placeholder="e.g. 9912551260"
                    className="w-full text-xs font-semibold px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={interestAddress}
                  onChange={(e) => setInterestAddress(e.target.value)}
                  placeholder="Street address, landmarks..."
                  className="w-full text-xs font-semibold px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">City</label>
                  <input
                    type="text"
                    required
                    value={interestCity}
                    onChange={(e) => setInterestCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full text-xs font-semibold px-3 py-2 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">State</label>
                  <input
                    type="text"
                    required
                    value={interestState}
                    onChange={(e) => setInterestState(e.target.value)}
                    placeholder="Delhi"
                    className="w-full text-xs font-semibold px-3 py-2 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Pincode</label>
                  <input
                    type="text"
                    required
                    value={interestPincode}
                    onChange={(e) => setInterestPincode(e.target.value)}
                    placeholder="110001"
                    className="w-full text-xs font-semibold px-3 py-2 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">No. of Tables</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={interestTables}
                    onChange={(e) => setInterestTables(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Quantity Needed</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={interestQty}
                    onChange={(e) => setInterestQty(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              {/* Color Selector */}
              <div className="space-y-2 mt-2 pt-2 border-t border-border/50">
                <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Star className="h-3 w-3 text-primary" /> Preferred Sticker Color
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {(Object.keys(colorOptions) as Array<keyof typeof colorOptions>).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setInterestQrColor(color)}
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-sm transition-all ${
                        interestQrColor === color ? "border-primary scale-110 ring-4 ring-primary/10" : "border-transparent hover:scale-105"
                      } bg-gradient-to-br ${colorOptions[color].gradient}`}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                    >
                      {interestQrColor === color && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full shadow-md" />
                      )}
                    </button>
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1 capitalize font-medium">
                    {interestQrColor}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingInterest}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 gradient-primary text-white font-bold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-xs"
              >
                {submittingInterest ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Notify Me When Available
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
