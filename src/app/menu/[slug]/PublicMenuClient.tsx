"use client";

import { useEffect, useState } from "react";
import {
  UtensilsCrossed,
  Search,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Flame,
  ChefHat,
  Loader2,
  AlertCircle,
  QrCode,
  Ticket,
  Download,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  isVeg: boolean;
  isRecommended: boolean;
  isBestSeller: boolean;
  isChefSpecial: boolean;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  menuItems: MenuItem[];
}

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  description: string | null;
  address: string | null;
  mobile: string | null;
  openingTime: string | null;
  closingTime: string | null;
  categories: Category[];
  lastUpdated?: string;
  googleReviewUrl?: string | null;
  planName?: string;
}

export default function PublicMenuClient({ slug }: { slug: string }) {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isClosed, setIsClosed] = useState(false);

  // Coupons State
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
  } | null>(null);

  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleDownloadMenuPDF = async () => {
    if (!restaurant) return;
    setDownloadingPDF(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      // Header Branding banner
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text(restaurant.name, 14, 25);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      if (restaurant.description) {
        doc.text(restaurant.description.substring(0, 85), 14, 32);
      }
      
      let y = 50;
      restaurant.categories.forEach((cat) => {
        if (cat.menuItems.length === 0) return;
        
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(249, 115, 22);
        doc.text(cat.name, 14, y);
        doc.line(14, y + 2, 196, y + 2);
        
        y += 10;
        
        cat.menuItems.forEach((item) => {
          if (!item.isAvailable) return;
          
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(30, 41, 59);
          
          const vegSymbol = item.isVeg ? "[V]" : "[N]";
          doc.text(`${vegSymbol} ${item.name}`, 14, y);
          
          const activePrice = item.discountPrice !== null && item.discountPrice !== undefined 
            ? `Rs. ${item.discountPrice.toFixed(2)} (Offer!)` 
            : `Rs. ${item.price.toFixed(2)}`;
          doc.text(activePrice, 196 - doc.getTextWidth(activePrice), y);
          
          if (item.description) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(item.description.substring(0, 100), 14, y + 5);
            y += 12;
          } else {
            y += 8;
          }
        });
        
        y += 6;
      });
      
      doc.save(`${restaurant.slug}-menu.pdf`);
      toast.success("Menu PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF menu");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleApplyCoupon = async () => {
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/public/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, code: cleanCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data.data);
        toast.success(`Coupon "${cleanCode}" applied successfully!`);
      } else {
        toast.error(data.error || "Invalid coupon code");
      }
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const getPlanBackgroundClass = () => {
    if (!restaurant) return "min-h-screen bg-muted/20 pb-20";
    if (restaurant.planName === "ENTERPRISE") {
      return "min-h-screen bg-zinc-950 text-zinc-100 pb-20";
    }
    if (restaurant.planName === "PRO") {
      return "min-h-screen bg-slate-950 text-slate-100 pb-20";
    }
    return "min-h-screen bg-muted/20 pb-20 text-foreground";
  };

  const getCardStyle = () => {
    if (restaurant?.planName === "ENTERPRISE") {
      return "bg-zinc-900/80 border border-amber-500/20 backdrop-blur-md shadow-2xl hover:border-amber-500/40";
    }
    if (restaurant?.planName === "PRO") {
      return "bg-slate-900/80 border border-orange-500/15 backdrop-blur-md shadow-xl hover:border-orange-500/30";
    }
    return "bg-card border border-border shadow-xs";
  };

  useEffect(() => {
    // Generate/retrieve anonymous visitor ID
    let visitorId = localStorage.getItem("dineo_visitor_id");
    if (!visitorId) {
      visitorId = "vis_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("dineo_visitor_id", visitorId);
    }

    async function fetchMenu() {
      try {
        const res = await fetch(`/api/public/menu/${slug}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Restaurant menu not found");
        }
        setRestaurant(data.data);

        // Record scan analytics once per tab session to avoid double/triple counting
        const scanKey = `dineo_scanned_${slug}`;
        if (!sessionStorage.getItem(scanKey)) {
          sessionStorage.setItem(scanKey, "true");
          fetch("/api/public/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, visitorId, referrer: document.referrer }),
          }).catch((err) => console.error("Failed to record scan analytics:", err));
        }

        // Check if the restaurant is closed
        const opening = data.data.openingTime;
        const closing = data.data.closingTime;
        if (opening && closing) {
          try {
            const now = new Date();
            const currentMin = now.getHours() * 60 + now.getMinutes();

            const parseTimeToMinutes = (t: string) => {
              const cleaned = t.trim().toUpperCase();
              const matches = cleaned.match(/^(\d+):(\d+)\s*(AM|PM)?/);
              if (!matches) {
                const parts = cleaned.split(":");
                if (parts.length >= 2) {
                  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                }
                return null;
              }
              let hours = parseInt(matches[1], 10);
              const minutes = parseInt(matches[2], 10);
              const ampm = matches[3];

              if (ampm === "PM" && hours < 12) hours += 12;
              if (ampm === "AM" && hours === 12) hours = 0;
              return hours * 60 + minutes;
            };

            const openMin = parseTimeToMinutes(opening);
            const closeMin = parseTimeToMinutes(closing);

            if (openMin !== null && closeMin !== null) {
              if (openMin < closeMin) {
                setIsClosed(currentMin < openMin || currentMin > closeMin);
              } else {
                // Overnight hours
                setIsClosed(currentMin < openMin && currentMin > closeMin);
              }
            }
          } catch (e) {
            console.error("Error parsing hours:", e);
          }
        }

        // Record scan analytics asynchronously
        fetch("/api/public/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slug,
            referrer: document.referrer || null,
            visitorId,
          }),
        }).catch((err) => console.error("Error recording scan:", err));

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load menu";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center animate-pulse mb-4">
          <QrCode className="h-6 w-6 text-white" />
        </div>
        <p className="font-semibold text-muted-foreground animate-pulse text-sm">
          Loading restaurant menu...
        </p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 mb-4">
          <UtensilsCrossed className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-extrabold mb-1">Menu Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {error || "The menu you are looking for is currently unavailable or inactive."}
        </p>
        <a
          href="/"
          className="gradient-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md"
        >
          Return to Home
        </a>
      </div>
    );
  }

  // Filter Categories & Items
  const filteredCategories = restaurant.categories
    .map((cat) => {
      const items = cat.menuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return { ...cat, menuItems: items };
    })
    .filter((cat) =>
      activeCategory === "all" ? cat.menuItems.length > 0 : cat.id === activeCategory
    );

  return (
    <div className={getPlanBackgroundClass()}>
      {/* Closed Warning Banner */}
      {isClosed && (
        <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-b border-amber-500/20 py-3 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
          <Clock className="h-4 w-4 text-amber-500 animate-spin-slow" />
          <span>Restaurant is currently closed ({restaurant.openingTime} - {restaurant.closingTime}). Showing menu preview.</span>
        </div>
      )}

      {/* Cover Image & Header */}
      <div className="relative bg-gradient-to-b from-orange-500 to-amber-600 text-white pb-8 pt-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          {/* Logo */}
          <div className="h-20 w-20 rounded-2xl bg-white p-1 shadow-xl mb-4 flex items-center justify-center overflow-hidden border-2 border-white/20">
            {restaurant.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="h-full w-full rounded-xl gradient-primary flex items-center justify-center">
                <UtensilsCrossed className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {restaurant.name}
          </h1>

          {restaurant.description && (
            <p className="text-xs sm:text-sm text-white/90 max-w-md mt-2 leading-relaxed">
              {restaurant.description}
            </p>
          )}

          {restaurant.lastUpdated && (
            <div className="text-[10px] font-bold text-white/80 bg-white/10 px-3.5 py-1 rounded-full mt-2.5 inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/70" />
              Menu updated: {new Date(restaurant.lastUpdated).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </div>
          )}

          {/* Quick Info Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-medium text-white/90">
            {restaurant.mobile && (
              <a
                href={`tel:${restaurant.mobile}`}
                className="flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
              >
                <Phone className="h-3 w-3" /> {restaurant.mobile}
              </a>
            )}
            {restaurant.address && (
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full">
                <MapPin className="h-3 w-3" /> {restaurant.address}
              </div>
            )}
            {(restaurant.openingTime || restaurant.closingTime) && (
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full">
                <Clock className="h-3 w-3" />{" "}
                {restaurant.openingTime || "Open"} - {restaurant.closingTime || "Close"}
              </div>
            )}
            <button
              onClick={handleDownloadMenuPDF}
              disabled={downloadingPDF}
              className="flex items-center gap-1.5 bg-white/25 hover:bg-white/35 backdrop-blur-xs px-3.5 py-1 rounded-full text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {downloadingPDF ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              Download PDF Menu
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-4">
        {/* Search Bar */}
        <div className="relative mb-4 shadow-lg rounded-2xl overflow-hidden">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for dishes, starters, drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary shadow-xs"
          />
        </div>

        {/* Coupon Widget */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-foreground">
              <Ticket className="h-4 w-4 text-primary" /> Apply Promo Code
            </h3>
            {appliedCoupon && (
              <button
                onClick={handleRemoveCoupon}
                className="text-[10px] text-red-500 font-bold hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Promo Code (e.g. SAVE10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 bg-background border border-border text-xs font-semibold rounded-xl uppercase outline-hidden focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={validatingCoupon}
                className="gradient-primary text-white font-semibold text-xs px-4 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
              >
                {validatingCoupon && <Loader2 className="h-3 w-3 animate-spin" />}
                Apply
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Code Applied: {appliedCoupon.code} ({appliedCoupon.discountType === "PERCENT" ? `${appliedCoupon.discountValue}% Off` : `₹${appliedCoupon.discountValue} Off`})</span>
              <span className="text-emerald-600 dark:text-emerald-400">✓ Applied</span>
            </div>
          )}
        </div>

        {/* Sticky Category Scrollbar */}
        <div className="sticky top-2 z-30 bg-background/80 backdrop-blur-md p-2 rounded-2xl border border-border shadow-md mb-6 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === "all"
                ? "gradient-primary text-white shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            All Items
          </button>
          {restaurant.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "gradient-primary text-white shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name} ({cat.menuItems.length})
            </button>
          ))}
        </div>

        {/* Category Sections */}
        {filteredCategories.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl p-6 ${getCardStyle()}`}>
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="font-bold text-sm">No items found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching with a different dish name or category.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <h2 className="text-lg font-extrabold tracking-tight">
                    {category.name}
                  </h2>
                  <span className="text-xs text-muted-foreground font-semibold">
                    ({category.menuItems.length})
                  </span>
                </div>

                {category.description && (
                  <p className="text-xs text-muted-foreground">
                    {category.description}
                  </p>
                )}

                {/* Items Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {category.menuItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl flex gap-4 transition-all ${getCardStyle()} ${
                        !item.isAvailable ? "opacity-70" : ""
                      }`}
                    >
                      {/* Image Thumbnail */}
                      {item.imageUrl && (
                        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                              <span className="text-[9px] font-extrabold text-white bg-red-600 px-1.5 py-0.5 rounded uppercase">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                                  item.isVeg ? "bg-green-600" : "bg-red-600"
                                }`}
                              />
                              <h3 className="font-bold text-sm sm:text-base leading-snug truncate">
                                {item.name}
                              </h3>
                            </div>
                            <span className="font-extrabold text-sm sm:text-base text-right flex-shrink-0 flex flex-col items-end">
                              {item.discountPrice !== null && item.discountPrice !== undefined ? (
                                <>
                                  <span className="text-primary">
                                    ₹{item.discountPrice.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground line-through font-medium">
                                    ₹{item.price.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="gradient-text">
                                  ₹{item.price.toFixed(2)}
                                </span>
                              )}
                              {appliedCoupon && appliedCoupon.discountType === "PERCENT" && (
                                <span className="text-[9px] font-bold text-green-600 dark:text-green-400 mt-0.5 whitespace-nowrap">
                                  With Coupon: ₹{((item.discountPrice ?? item.price) * (1 - appliedCoupon.discountValue / 100)).toFixed(2)}
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Description */}
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Footer Badges & Out of stock status */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-border/50">
                          <div className="flex flex-wrap gap-1">
                            {item.isRecommended && (
                              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Sparkles className="h-2.5 w-2.5" /> Recommended
                              </span>
                            )}
                            {item.isBestSeller && (
                              <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Flame className="h-2.5 w-2.5" /> Bestseller
                              </span>
                            )}
                            {item.isChefSpecial && (
                              <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <ChefHat className="h-2.5 w-2.5" /> Chef Special
                              </span>
                            )}
                          </div>

                          {!item.isAvailable && (
                            <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-16 text-center text-xs text-muted-foreground">
        Powered by <span className="font-bold gradient-text">Dineo</span> · Smart Digital Menu
      </div>

      {restaurant.googleReviewUrl && (
        <a
          href={restaurant.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-40 bg-card border border-border shadow-2xl rounded-full px-4 py-2.5 flex items-center gap-2 hover:-translate-y-0.5 transition-all text-xs font-bold text-foreground hover:shadow-lg cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          <span>Review us on Google</span>
        </a>
      )}
    </div>
  );
}
