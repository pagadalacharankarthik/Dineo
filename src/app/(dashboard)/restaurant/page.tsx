"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save, Building2, Upload, Link2 } from "lucide-react";
import { restaurantSchema, type RestaurantInput } from "@/lib/validations/restaurant";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Input({
  id,
  placeholder,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
      {...props}
    />
  );
}

export default function RestaurantPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [planName, setPlanName] = useState("FREE_TRIAL");
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [showOfferBanner, setShowOfferBanner] = useState(false);
  const [offerBannerText, setOfferBannerText] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RestaurantInput>({
    resolver: zodResolver(restaurantSchema),
  });

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch("/api/restaurant");
        const data = await res.json();
        if (data.success && data.data) {
          setPlanName(data.data.planName || "FREE_TRIAL");
          setShowTrialBanner(data.data.showTrialBanner ?? false);
          setShowOfferBanner(data.data.showOfferBanner ?? false);
          setOfferBannerText(data.data.offerBannerText || "");
          // Fill empty strings for null values
          const cleaned = Object.fromEntries(
            Object.entries(data.data).map(([k, v]) => [k, v ?? ""])
          );
          reset(cleaned);
        }
      } catch {
        toast.error("Failed to load restaurant data");
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [reset]);

  const handleImageUpload = async (file: File, field: "logo" | "coverImage") => {
    const isLogo = field === "logo";
    if (isLogo) setUploadingLogo(true);
    else setUploadingCover(true);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (data.success) {
        setValue(field, data.url);
        toast.success(`${isLogo ? "Logo" : "Cover image"} uploaded!`);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  const onSubmit = async (data: RestaurantInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/restaurant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!result.success) {
        toast.error(result.error || "Failed to save restaurant");
        return;
      }
      toast.success("Restaurant profile saved!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading restaurant..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Promotion Banners */}
      {showTrialBanner && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold flex items-center justify-between gap-4 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <p>
              Your restaurant menu is currently on the <strong>Free Trial Plan</strong>. Upgrade your subscription to keep scan metrics active and customize your QR codes!
            </p>
          </div>
          <Link
            href="/subscription"
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shrink-0 text-center"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {showOfferBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold flex items-center justify-between gap-4 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <p>{offerBannerText}</p>
          </div>
          <Link
            href="/qr-kit"
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors shrink-0 text-center"
          >
            Claim Offer
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">Restaurant Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your restaurant information, custom URL slug, and branding settings.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ─── Basic Info & Custom Slug ─── */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-base font-bold">Basic Information & URL Slug</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="res-name" label="Restaurant Name *" error={errors.name?.message}>
              <Input
                id="res-name"
                placeholder="Sharma's Kitchen"
                {...register("name")}
              />
            </FormField>
            <FormField id="res-slug" label="Custom Menu URL Slug" error={errors.slug?.message}>
              <div className="flex items-center rounded-xl border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary">
                <span className="text-muted-foreground text-xs font-mono select-none mr-1">
                  /menu/
                </span>
                <input
                  id="res-slug"
                  type="text"
                  placeholder="my-restaurant"
                  className="w-full bg-transparent outline-hidden text-sm font-mono"
                  {...register("slug")}
                />
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="res-email" label="Business Email" error={errors.email?.message}>
              <Input
                id="res-email"
                type="email"
                placeholder="info@restaurant.com"
                {...register("email")}
              />
            </FormField>
            <FormField id="res-mob" label="Mobile Number" error={errors.mobile?.message}>
              <Input id="res-mob" placeholder="+91 99125 51260" {...register("mobile")} />
            </FormField>
          </div>

          <FormField id="res-desc" label="Description" error={errors.description?.message}>
            <textarea
              id="res-desc"
              rows={3}
              placeholder="Tell customers about your cuisine, ambiance, and specialty..."
              {...register("description")}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary transition-colors resize-none"
            />
          </FormField>
        </div>

        {/* ─── Media & Branding ─── */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-base font-bold">Media & Branding</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="res-logo" label="Logo Image URL" error={errors.logo?.message}>
              <div className="flex items-center gap-2">
                <Input id="res-logo" placeholder="https://... or /uploads/..." {...register("logo")} />
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "logo");
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload
                </button>
              </div>
            </FormField>

            <FormField id="res-cover" label="Cover Image URL" error={errors.coverImage?.message}>
              <div className="flex items-center gap-2">
                <Input id="res-cover" placeholder="https://... or /uploads/..." {...register("coverImage")} />
                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "coverImage");
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload
                </button>
              </div>
            </FormField>
          </div>
        </div>

        {/* ─── Location ─── */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-base font-bold">Location & Address</h2>
          <FormField id="res-addr" label="Street Address" error={errors.address?.message}>
            <Input id="res-addr" placeholder="123 Main Street, Sector 15" {...register("address")} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField id="res-city" label="City" error={errors.city?.message}>
              <Input id="res-city" placeholder="Mumbai" {...register("city")} />
            </FormField>
            <FormField id="res-state" label="State" error={errors.state?.message}>
              <Input id="res-state" placeholder="Maharashtra" {...register("state")} />
            </FormField>
            <FormField id="res-country" label="Country" error={errors.country?.message}>
              <Input id="res-country" placeholder="India" {...register("country")} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="res-pin" label="Pincode" error={errors.pincode?.message}>
              <Input id="res-pin" placeholder="400001" {...register("pincode")} />
            </FormField>
          </div>
        </div>

        {/* ─── Online Presence ─── */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-base font-bold">Social & Online Presence</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField id="res-website" label="Website" error={errors.website?.message}>
              <Input id="res-website" placeholder="https://yourwebsite.com" {...register("website")} />
            </FormField>
            <FormField id="res-ig" label="Instagram" error={errors.instagram?.message}>
              <Input id="res-ig" placeholder="@yourrestaurant" {...register("instagram")} />
            </FormField>
            <FormField id="res-fb" label="Facebook" error={errors.facebook?.message}>
              <Input id="res-fb" placeholder="facebook.com/yourrestaurant" {...register("facebook")} />
            </FormField>
            <FormField id="res-google-review" label={
              <span className="flex items-center gap-2">
                Google Reviews Link
                {planName === "FREE_TRIAL" && (
                  <span className="text-[9px] lowercase font-bold tracking-normal px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500">
                    Pro tier
                  </span>
                )}
              </span>
            } error={errors.googleReviewUrl?.message}>
              <Input 
                id="res-google-review" 
                placeholder={planName === "FREE_TRIAL" ? "Upgrade to Pro to link Google reviews" : "https://g.page/r/.../review"} 
                disabled={planName === "FREE_TRIAL"}
                {...register("googleReviewUrl")} 
              />
            </FormField>
          </div>
        </div>

        {/* ─── Operating Hours ─── */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-base font-bold">Operating Hours</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="res-open" label="Opening Time" error={errors.openingTime?.message}>
              <Input id="res-open" type="time" {...register("openingTime")} />
            </FormField>
            <FormField id="res-close" label="Closing Time" error={errors.closingTime?.message}>
              <Input id="res-close" type="time" {...register("closingTime")} />
            </FormField>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            id="restaurant-save"
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving Changes..." : "Save Restaurant Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
