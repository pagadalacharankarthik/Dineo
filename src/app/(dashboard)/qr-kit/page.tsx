"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Send,
  Loader2,
  Calendar,
  Layers,
  MapPin,
  ClipboardList,
  Sparkles,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

interface QRKitRequest {
  id: string;
  restaurantName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  tableCount: number;
  quantityNeeded: number;
  notes: string | null;
  status: string;
  createdAt: string;
}

const products = [
  {
    name: "Acrylic Table QR Stand",
    description: "Elegant, durable L-shaped stand for restaurant tables and counters. Scratch resistant.",
    gradient: "from-blue-500 to-indigo-600",
    price: "₹199 / stand",
  },
  {
    name: "Premium Acrylic Stand",
    description: "T-shaped double-sided display stand. Ideal for dual menu presentation.",
    gradient: "from-purple-500 to-pink-600",
    price: "₹499 / stand",
  },
  {
    name: "Waterproof QR Sticker",
    description: "High quality adhesive stickers, weatherproof and heat resistant. Perfect for outdoor tables.",
    gradient: "from-green-500 to-emerald-600",
    price: "₹99 / pack",
  },
  {
    name: "Counter Display QR Stand",
    description: "Chunky premium counter stand block. Perfect at billing and check-out counters.",
    gradient: "from-orange-500 to-red-600",
    price: "₹299 / stand",
  },
  {
    name: "Window QR Sticker",
    description: "Front-adhesive window cling sticker to attract bypassers to check the menu.",
    gradient: "from-teal-500 to-cyan-600",
    price: "₹149 / sticker",
  },
  {
    name: "Restaurant Branding Sticker",
    description: "Pack of 10 customized brand identity stickers to paste around delivery boxes.",
    gradient: "from-rose-500 to-red-600",
    price: "₹199 / pack",
  },
  {
    name: "Table Number Stickers",
    description: "Consecutively numbered high-tack stickers mapping individual tables directly.",
    gradient: "from-amber-500 to-yellow-600",
    price: "₹149 / set",
  },
];

export default function QRKitPage() {
  const [requests, setRequests] = useState<QRKitRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "requests">("products");

  // Form State
  const [restaurantName, setRestaurantName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [tableCount, setTableCount] = useState(1);
  const [quantityNeeded, setQuantityNeeded] = useState(1);
  const [preferredPlan, setPreferredPlan] = useState("STARTER");
  const [kitType, setKitType] = useState("ACRYLIC_STAND");
  const [notes, setNotes] = useState("");

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch("/api/qr-kit");
      const json = await res.json();
      if (json.success) {
        setRequests(json.data);
      }
    } catch (err) {
      console.error("Error loading kit requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    async function prefillForm() {
      try {
        const res = await fetch("/api/restaurant");
        const json = await res.json();
        if (json.success && json.data) {
          setRestaurantName(json.data.name || "");
          setAddress(json.data.address || "");
          setPhone(json.data.mobile || "");
          setEmail(json.data.email || "");
        }
      } catch (err) {
        console.error("Prefill error:", err);
      }
    }
    prefillForm();
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/qr-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName,
          contactPerson,
          phone,
          email,
          address,
          city,
          state,
          pincode,
          tableCount: Number(tableCount),
          quantityNeeded: Number(quantityNeeded),
          notes: notes ? `${notes} | Kit Type: ${kitType} | Preferred Plan: ${preferredPlan}` : `Kit Type: ${kitType} | Preferred Plan: ${preferredPlan}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Interest submitted successfully! We will contact you soon.");
        setContactPerson("");
        setNotes("");
        setTableCount(1);
        setQuantityNeeded(1);
        fetchRequests();
        setActiveTab("requests");
      } else {
        toast.error(json.error || "Failed to submit interest form.");
      }
    } catch (err) {
      toast.error("An error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
      case "PROCESSING":
        return "bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400";
      case "SHIPPED":
        return "bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400";
      case "CANCELLED":
        return "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400";
      default:
        return "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
          <ShoppingBag className="h-7 w-7 text-primary" /> Physical QR Starter Kit
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Order professional, waterproof table stands and branded QR stickers.
        </p>
      </div>

      <div className="w-full">
        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-2 p-1 bg-muted/30 border border-border rounded-xl max-w-sm">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "products"
                ? "bg-card text-foreground shadow-xs border border-border/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Browse Products
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "requests"
                ? "bg-card text-foreground shadow-xs border border-border/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Requests ({requests.length})
          </button>
        </div>

        {/* Tab 1: Products */}
        {activeTab === "products" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.name}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between"
                >
                  {/* Visual placeholder */}
                  <div className={`h-40 bg-gradient-to-tr ${prod.gradient} relative flex items-center justify-center p-6 text-white`}>
                    <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-xs text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md text-white border border-white/10">
                      Coming Soon
                    </div>
                    <ShoppingBag className="h-16 w-16 opacity-30 animate-pulse" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-extrabold text-base leading-snug">{prod.name}</h3>
                        <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                          {prod.price}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          {/* Interest Form */}
          <div className="max-w-3xl rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs">
            <h2 className="text-lg font-bold flex items-center gap-1.5 mb-2">
              <Sparkles className="h-5 w-5 text-primary" /> Express Interest & Pre-order
            </h2>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Fill out this quick form. We will reach out with customized mockups, branding options, and pricing estimates once starter kits are available!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Restaurant Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Restaurant Name</label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Enter Restaurant Name"
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                {/* Contact Person */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Your Name"
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@restaurant.com"
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9988776655"
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Full Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, locality, landmarks..."
                  className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Delhi"
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                {/* Pincode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="110001"
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Tables Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Number of Tables</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={tableCount}
                    onChange={(e) => setTableCount(Number(e.target.value))}
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Quantity Needed (Stands/Kits)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quantityNeeded}
                    onChange={(e) => setQuantityNeeded(Number(e.target.value))}
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                {/* Plan Preference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subscription Preference</label>
                  <select
                    value={preferredPlan}
                    onChange={(e) => setPreferredPlan(e.target.value)}
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  >
                    <option value="STARTER">Starter Plan (Free / ₹0)</option>
                    <option value="PRO">Professional Plan (₹999/mo)</option>
                    <option value="ENTERPRISE">Enterprise Plan (₹2,999/mo)</option>
                  </select>
                </div>

                {/* Kit Type Preference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Preferred Kit Type</label>
                  <select
                    value={kitType}
                    onChange={(e) => setKitType(e.target.value)}
                    className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden"
                  >
                    <option value="ACRYLIC_STAND">Acrylic Table QR Stands</option>
                    <option value="STICKER_PACK">Waterproof Table Stickers</option>
                    <option value="WINDOW_STICKER">Window Cling Stickers</option>
                    <option value="COMBO_PACK">Combo Pack (Stands + Stickers)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Additional Notes / Custom Requests</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Need custom logo print, wood bases instead of acrylic, specific stickers, etc."
                  className="w-full text-sm font-medium px-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-hidden resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 gradient-primary text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Submit Pre-Order Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Requests History */}
        {activeTab === "requests" && (
          <div className="animate-in fade-in duration-300">
            {loadingRequests ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-3xl p-6">
                <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="font-bold text-sm">No requests found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You haven&apos;t expressed interest in physical QR stands yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                      <div>
                        <p className="text-sm font-bold text-foreground flex items-center gap-1">
                          <ShoppingBag className="h-4 w-4 text-primary" /> QR Starter Kit Request
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" /> Submitted on {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Contact Details</p>
                        <p className="font-semibold text-foreground mt-0.5">{req.contactPerson}</p>
                        <p className="text-muted-foreground mt-0.5">{req.phone}</p>
                        <p className="text-muted-foreground mt-0.5">{req.email}</p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Quantities</p>
                        <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                          <Layers className="h-3 w-3 text-muted-foreground" /> {req.quantityNeeded} Kits / Stands
                        </p>
                        <p className="text-muted-foreground mt-0.5">For {req.tableCount} tables</p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" /> Delivery Address
                        </p>
                        <p className="font-medium text-foreground mt-0.5">{req.address}</p>
                        <p className="text-muted-foreground mt-0.5">{req.city}, {req.state} - {req.pincode}</p>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/55 text-xs text-muted-foreground leading-relaxed flex gap-1.5">
                        <ClipboardList className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Notes / Customizations</p>
                          <p className="mt-0.5">{req.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
