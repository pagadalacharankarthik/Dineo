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
  Star,
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
  createdAt?: string;
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
  themeColor?: string | null;
  coupons?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    expiresAt?: string | null;
  }[];
}

type Language = "en" | "es" | "hi" | "fr" | "tel";

const translations: Record<Language, Record<string, string>> = {
  en: {
    searchPlaceholder: "Search for dishes, starters, drinks...",
    applyPromoCode: "Apply Promo Code",
    enterPromoCode: "Enter Promo Code (e.g. SAVE10)",
    apply: "Apply",
    remove: "Remove",
    codeApplied: "Code Applied",
    applied: "Applied",
    allItems: "All Items",
    noItemsFound: "No items found",
    trySearchingDifferent: "Try searching with a different dish name or category.",
    outOfStock: "Out of stock",
    menuUpdated: "Menu updated",
    downloadPdf: "Download PDF Menu",
    restaurantClosed: "Restaurant is currently closed",
    showingPreview: "Showing menu preview",
    returnHome: "Return to Home",
    menuNotFound: "Menu Not Found",
    menuUnavailable: "The menu you are looking for is currently unavailable or inactive.",
    poweredBy: "Powered by",
    recommended: "Recommended",
    bestseller: "Bestseller",
    chefSpecial: "Chef Special",
    reviewGoogle: "Loved your meal? Leave us a Google Review",
    new: "New",
    popular: "Popular",
  },
  es: {
    searchPlaceholder: "Buscar platos, entradas, bebidas...",
    applyPromoCode: "Aplicar código de promoción",
    enterPromoCode: "Ingrese el código (ej. SAVE10)",
    apply: "Aplicar",
    remove: "Eliminar",
    codeApplied: "Código aplicado",
    applied: "Aplicado",
    allItems: "Todos los platos",
    noItemsFound: "No se encontraron platos",
    trySearchingDifferent: "Intente buscar con otra palabra.",
    outOfStock: "Agotado",
    menuUpdated: "Menú actualizado",
    downloadPdf: "Descargar menú PDF",
    restaurantClosed: "El restaurante está cerrado",
    showingPreview: "Mostrando vista previa del menú",
    returnHome: "Volver al inicio",
    menuNotFound: "Menú no encontrado",
    menuUnavailable: "El menú no está disponible o está inactivo.",
    poweredBy: "Desarrollado por",
    recommended: "Recomendado",
    bestseller: "Más vendido",
    chefSpecial: "Especial del Chef",
    reviewGoogle: "Danos tu opinión en Google",
  },
  hi: {
    searchPlaceholder: "व्यंजन, स्टार्टर्स, ड्रिंक्स खोजें...",
    applyPromoCode: "प्रोमो कोड लागू करें",
    enterPromoCode: "कोड दर्ज करें (उदा. SAVE10)",
    apply: "लागू करें",
    remove: "हटाएं",
    codeApplied: "कोड लागू हो गया",
    applied: "लागू",
    allItems: "सभी व्यंजन",
    noItemsFound: "कोई आइटम नहीं मिला",
    trySearchingDifferent: "किसी अन्य नाम से खोजें।",
    outOfStock: "उपलब्ध नहीं है",
    menuUpdated: "मेन्यू अपडेट किया गया",
    downloadPdf: "PDF मेन्यू डाउनलोड करें",
    restaurantClosed: "रेस्तरां अभी बंद है",
    showingPreview: "पूर्वावलोकन दिखा रहा है",
    returnHome: "होम पर जाएं",
    menuNotFound: "मेन्यू नहीं मिला",
    menuUnavailable: "यह मेन्यू वर्तमान में अनुपलब्ध या निष्क्रिय है।",
    poweredBy: "संचालित द्वारा",
    recommended: "अनुशंसित",
    bestseller: "बेस्टसेलर",
    chefSpecial: "शेफ स्पेशल",
    reviewGoogle: "गूगल पर समीक्षा करें",
  },
  fr: {
    searchPlaceholder: "Rechercher des plats, entrées, boissons...",
    applyPromoCode: "Appliquer le code promo",
    enterPromoCode: "Entrez le code promo (ex. SAVE10)",
    apply: "Appliquer",
    remove: "Supprimer",
    codeApplied: "Code appliqué",
    applied: "Appliqué",
    allItems: "Tous les articles",
    noItemsFound: "Aucun article trouvé",
    trySearchingDifferent: "Essayez avec d'autres mots-clés.",
    outOfStock: "Rupture de stock",
    menuUpdated: "Menu mis à jour",
    downloadPdf: "Télécharger le menu PDF",
    restaurantClosed: "Le restaurant est fermé",
    showingPreview: "Affichage de l'aperçu du menu",
    returnHome: "Retour à l'accueil",
    menuNotFound: "Menu non trouvé",
    menuUnavailable: "Ce menu est indisponible ou inactif.",
    poweredBy: "Propulsé par",
    recommended: "Recommandé",
    bestseller: "Best-seller",
    chefSpecial: "Spécial Chef",
    reviewGoogle: "Avis sur Google",
  },
  tel: {
    searchPlaceholder: "వంటకాలు, పానీయాల కోసం వెతకండి...",
    applyPromoCode: "ప్రోమో కోడ్ ఉపయోగించండి",
    enterPromoCode: "కోడ్ నమోదు చేయండి (ఉదా. SAVE10)",
    apply: "వర్తించు",
    remove: "తొలగించు",
    codeApplied: "కోడ్ వర్తించబడింది",
    applied: "వర్తించబడింది",
    allItems: "అన్ని వంటకాలు",
    noItemsFound: "ఏ వంటకాలూ లభించలేదు",
    trySearchingDifferent: "మరొక పేరుతో వెతకండి.",
    outOfStock: "స్టాక్ లేదు",
    menuUpdated: "మెనూ నవీకరించబడింది",
    downloadPdf: "PDF మెనూ డౌన్‌లోడ్ చేయండి",
    restaurantClosed: "రెస్టారెంట్ ప్రస్తుతం మూసివేయబడింది",
    showingPreview: "మెనూ ప్రివ్యూ చూపబడుతోంది",
    returnHome: "హోమ్ కి వెళ్ళండి",
    menuNotFound: "మెనూ కనుగొనబడలేదు",
    menuUnavailable: "ఈ మెనూ ప్రస్తుతం అందుబాటులో లేదు.",
    poweredBy: "సహకారంతో",
    recommended: "సిఫార్సు చేయబడింది",
    bestseller: "బెస్ట్ సెల్లర్",
    chefSpecial: "షెఫ్ స్పెషల్",
    reviewGoogle: "గూగుల్ లో రివ్యూ చేయండి",
  }
};

export default function PublicMenuClient({ slug }: { slug: string }) {
  const [lang, setLang] = useState<Language>("en");
  const t = (key: string) => translations[lang]?.[key] || translations["en"]?.[key] || key;

  const isNewItem = (createdAt?: string) => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const selectCategory = (catId: string) => {
    setActiveCategory(catId);
    
    // Track views dynamically
    if (catId !== "all") {
      fetch("/api/public/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: catId }),
      }).catch((err) => console.error("Failed to record view analytics:", err));
    } else {
      const firstCat = restaurant?.categories?.[0];
      if (firstCat) {
        fetch("/api/public/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId: firstCat.id }),
        }).catch((err) => console.error("Failed to record view analytics:", err));
      }
    }

    setTimeout(() => {
      document.getElementById("menu-start")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isClosed, setIsClosed] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
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
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/public/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, code: cleanCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data.data);
        setCouponError(null);
        toast.success(`Coupon "${cleanCode}" applied successfully!`);
      } else {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Failed to apply coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
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

        // Record initial category view of the first category shown to the user
        const firstCategory = data.data.categories?.[0];
        if (firstCategory) {
          fetch("/api/public/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoryId: firstCategory.id }),
          }).catch((err) => console.error("Failed to record initial view:", err));
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
      <div className="min-h-screen bg-background pb-20 animate-pulse">
        {/* Cover Skeleton */}
        <div className="w-full h-64 bg-zinc-200 dark:bg-zinc-800/60 flex flex-col items-center justify-center relative">
          <div className="h-20 w-20 rounded-2xl bg-zinc-300 dark:bg-zinc-700/80 shadow-md mb-4 animate-pulse" />
          <div className="h-6 w-48 rounded bg-zinc-300 dark:bg-zinc-700/80 mb-2 animate-pulse" />
          <div className="h-4 w-64 rounded bg-zinc-300 dark:bg-zinc-700/80 animate-pulse" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-4 space-y-6">
          {/* Search bar skeleton */}
          <div className="h-12 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800/60" />

          {/* Filters skeleton */}
          <div className="flex justify-center gap-2">
            <div className="h-8 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800/60" />
            <div className="h-8 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800/60" />
            <div className="h-8 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800/60" />
          </div>

          {/* Category tabs skeleton */}
          <div className="h-12 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800/60" />

          {/* Cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-4 rounded-2xl border border-border bg-card flex gap-4">
                <div className="h-24 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800/60 flex-shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800/60 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800/60 rounded" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800/60 rounded w-5/6" />
                  </div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800/60 rounded w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 mb-4">
          <UtensilsCrossed className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-extrabold mb-1">{t("menuNotFound")}</h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {error || t("menuUnavailable")}
        </p>
        <a
          href="/"
          className="gradient-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md"
        >
          {t("returnHome")}
        </a>
      </div>
    );
  }

  // Filter Categories & Items
  const filteredCategories = restaurant.categories
    .map((cat) => {
      const items = cat.menuItems.filter((item) => {
        // Search filter match
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Diet (Veg/Non-veg) filter match
        let matchesDiet = true;
        if (dietFilter === "veg") {
          matchesDiet = item.isVeg;
        } else if (dietFilter === "non-veg") {
          matchesDiet = !item.isVeg;
        }

        return matchesSearch && matchesDiet;
      });
      return { ...cat, menuItems: items };
    })
    .filter((cat) =>
      activeCategory === "all" ? cat.menuItems.length > 0 : cat.id === activeCategory
    );

  return (
    <div className={getPlanBackgroundClass()}>
      {/* Free Plan branding top bar */}
      {restaurant.planName === "FREE_TRIAL" && (
        <div className="bg-orange-600 text-white py-2.5 px-4 text-center text-[10px] sm:text-xs font-black flex items-center justify-center gap-1.5 shadow-sm">
          <span>Create your own smart digital menu with</span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-90 font-black"
          >
            Dineo
          </a>
          <span>for free! 🚀</span>
        </div>
      )}

      {/* Closed Warning Banner */}
      {isClosed && (
        <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-b border-amber-500/20 py-3 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
          <Clock className="h-4 w-4 text-amber-500 animate-spin-slow" />
          <span>{t("restaurantClosed")} ({restaurant.openingTime} - {restaurant.closingTime}). {t("showingPreview")}.</span>
        </div>
      )}

      {/* Cover Image & Header */}
      <div className="relative text-white pb-12 pt-20 px-4 sm:px-6 overflow-hidden shadow-md isolate">
        {/* Cover Background */}
        {restaurant.coverImage ? (
          <div className="absolute inset-0 -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={restaurant.coverImage}
              alt="Restaurant Cover"
              className="w-full h-full object-cover scale-105 select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/65 to-black/85 backdrop-blur-[2.5px]" />
          </div>
        ) : (
          <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${
            restaurant.themeColor === "red"
              ? "from-red-600 to-red-800"
              : restaurant.themeColor === "blue"
              ? "from-blue-600 to-blue-800"
              : restaurant.themeColor === "green"
              ? "from-emerald-600 to-teal-800"
              : restaurant.themeColor === "purple"
              ? "from-purple-600 to-indigo-900"
              : restaurant.themeColor === "black"
              ? "from-zinc-800 to-zinc-950"
              : "from-orange-500 to-orange-700"
          }`}>
            <div className="absolute inset-0 bg-black/10" />
          </div>
        )}

        {/* Language Selector */}
        <div className="absolute top-4 right-4 z-10">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="bg-black/40 hover:bg-black/55 backdrop-blur-md text-white border border-white/20 text-xs font-bold py-1.5 px-2.5 rounded-xl outline-none cursor-pointer shadow-sm transition-all"
          >
            <option value="en" className="text-slate-900 bg-white">🇺🇸 EN</option>
            <option value="es" className="text-slate-900 bg-white">🇪🇸 ES</option>
            <option value="hi" className="text-slate-900 bg-white">🇮🇳 HI</option>
            <option value="fr" className="text-slate-900 bg-white">🇫🇷 FR</option>
            <option value="tel" className="text-slate-900 bg-white">🇮🇳 TE</option>
          </select>
        </div>

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
              {t("menuUpdated")}: {new Date(restaurant.lastUpdated).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
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
          </div>
        </div>
      </div>

      <div id="menu-start" className="max-w-3xl mx-auto px-4 sm:px-6 -mt-4 scroll-mt-24">
        {/* Search Bar */}
        <div className="relative mb-4 shadow-lg rounded-2xl overflow-hidden">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-xs rounded-2xl text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Diet/Veg Filter Switcher Pills */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <button
            onClick={() => setDietFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              dietFilter === "all"
                ? "bg-foreground text-background dark:bg-white dark:text-black border-foreground shadow-xs"
                : "bg-card text-muted-foreground border-border/50 hover:text-foreground"
            }`}
          >
            All Dishes
          </button>
          <button
            onClick={() => setDietFilter("veg")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              dietFilter === "veg"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-xs"
                : "bg-card text-muted-foreground border-border/50 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Veg Only
          </button>
          <button
            onClick={() => setDietFilter("non-veg")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              dietFilter === "non-veg"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500 shadow-xs"
                : "bg-card text-muted-foreground border-border/50 hover:text-rose-600 dark:hover:text-rose-400"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Non-Veg Only
          </button>
        </div>

        {/* Coupon Widget */}
        {restaurant.coupons && restaurant.coupons.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                  <Ticket className="h-4 w-4 text-primary" /> {t("applyPromoCode")}
                </h3>
                <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded select-all" title="Short Restaurant ID for Promo Validation">
                  Short ID: {restaurant.id.replace(/^cm/, "").substring(0, 8).toUpperCase()}
                </span>
              </div>
              {appliedCoupon && (
                <button
                  onClick={handleRemoveCoupon}
                  className="text-[10px] text-red-500 font-bold hover:underline"
                >
                  {t("remove")}
                </button>
              )}
            </div>
            {!appliedCoupon ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("enterPromoCode")}
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    className="flex-1 px-3 py-2 bg-background border border-border text-xs font-semibold rounded-xl uppercase outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon}
                    className="gradient-primary text-white font-semibold text-xs px-4 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {validatingCoupon && <Loader2 className="h-3 w-3 animate-spin" />}
                    {t("apply")}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-red-500 font-semibold px-1">
                    ⚠ {couponError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>{t("codeApplied")}: {appliedCoupon.code} ({appliedCoupon.discountType === "PERCENT" ? `${appliedCoupon.discountValue}% Off` : `₹${appliedCoupon.discountValue} Off`})</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ {t("applied")}</span>
              </div>
            )}
          </div>
        )}

        {/* Sticky Category Scrollbar */}
        <div className="sticky top-2.5 z-30 bg-background/85 backdrop-blur-md py-3 px-2.5 rounded-2xl border border-border shadow-lg mb-8 overflow-x-auto flex items-center gap-3 no-scrollbar transition-all duration-300">
          <button
            onClick={() => selectCategory("all")}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-300 transform ease-out border cursor-pointer ${
              activeCategory === "all"
                ? "gradient-primary text-white scale-105 shadow-[0_0_14px_rgba(249,115,22,0.45)] border-amber-400/30"
                : "bg-card text-muted-foreground hover:text-foreground hover:scale-102 border-border/40"
            }`}
          >
            {t("allItems")}
          </button>
          {restaurant.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 transform ease-out border cursor-pointer ${
                activeCategory === cat.id
                  ? "gradient-primary text-white scale-105 shadow-[0_0_14px_rgba(249,115,22,0.45)] border-amber-400/30"
                  : "bg-card text-muted-foreground hover:text-foreground hover:scale-102 border-border/40"
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
            <p className="font-bold text-sm">{t("noItemsFound")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("trySearchingDifferent")}
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
                                {t("outOfStock")}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm p-[1px] flex-shrink-0 ${
                                item.isVeg ? "border-green-600 dark:border-green-500" : "border-red-600 dark:border-red-500"
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  item.isVeg ? "bg-green-600 dark:bg-green-500" : "bg-red-600 dark:bg-red-500"
                                }`} />
                              </div>
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
                                <Sparkles className="h-2.5 w-2.5" /> {t("recommended")}
                              </span>
                            )}
                            {item.isBestSeller && (
                              <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Flame className="h-2.5 w-2.5" /> {t("popular")}
                              </span>
                            )}
                            {item.isChefSpecial && (
                              <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <ChefHat className="h-2.5 w-2.5" /> {t("chefSpecial")}
                              </span>
                            )}
                            {isNewItem(item.createdAt) && (
                              <span className="bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Sparkles className="h-2.5 w-2.5" /> {t("new")}
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
      <div className="mt-16 text-center text-xs text-muted-foreground pb-8">
        {t("poweredBy")}{" "}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold gradient-text hover:underline cursor-pointer"
        >
          Dineo
        </a>{" "}
        · Smart Digital Menu
      </div>

      {restaurant.googleReviewUrl && (
        <a
          href={restaurant.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-40 bg-card border border-border shadow-2xl rounded-full px-4 py-2.5 flex items-center gap-2 hover:-translate-y-0.5 transition-all text-xs font-bold text-foreground hover:shadow-lg cursor-pointer"
        >
          <Star className="h-4 w-4 text-amber-400 fill-current" />
          <span>{t("reviewGoogle")}</span>
        </a>
      )}
    </div>
  );
}
