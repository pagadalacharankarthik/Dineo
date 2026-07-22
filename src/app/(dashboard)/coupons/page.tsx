"use client";

import { useEffect, useState } from "react";
import {
  Ticket,
  Plus,
  Trash2,
  Calendar,
  Loader2,
  X,
  Sparkles,
  Inbox,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState("STARTER");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountValue: "",
    expiresAt: "",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const [couponsRes, restaurantRes] = await Promise.all([
        fetch("/api/coupons"),
        fetch("/api/restaurant")
      ]);
      const couponsJson = await couponsRes.json();
      const restaurantJson = await restaurantRes.json();
      
      if (couponsJson.success) {
        setCoupons(couponsJson.data);
      }
      if (restaurantJson.success && restaurantJson.data) {
        setPlanName(restaurantJson.data.planName || "STARTER");
      }
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setFormData({
      code: "",
      discountType: "PERCENT",
      discountValue: "",
      expiresAt: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      toast.error("Code must be at least 3 characters");
      return;
    }

    const valueNum = parseFloat(formData.discountValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      toast.error("Please enter a valid discount value");
      return;
    }

    if (formData.discountType === "PERCENT" && valueNum > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          discountType: formData.discountType,
          discountValue: valueNum,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create coupon");
      }

      toast.success("Coupon code created successfully!");
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to delete coupon");
      }
    } catch {
      toast.error("Failed to delete coupon");
    } finally {
      setDeletingId(null);
    }
  };

  const isExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  };

  if (planName === "STARTER" && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-card border border-border rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl">
          Pro Feature
        </div>
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/30 text-amber-600 mb-6">
          <Ticket className="h-8 w-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold mb-2 text-foreground">Unlock Promo Coupons</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
          Create percentage discounts or flat price cuts to boost customer order checkouts. This feature is exclusive to the **Professional** and **Enterprise** subscription tiers.
        </p>
        <a
          href="/settings"
          className="inline-flex items-center gap-2 gradient-primary text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md cursor-pointer"
        >
          Upgrade to Professional Tier
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <Ticket className="h-7 w-7 text-primary" /> Coupons & Special Offers
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create promotional discount codes that customers can apply on your digital menu page.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 gradient-primary text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 mb-4">
            <Ticket className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">No coupons active yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-6">
            Grow sales by creating coupon codes like &quot;WELCOME10&quot; or &quot;SUNDAY50&quot; for customer checkouts.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus className="h-4 w-4" /> Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.expiresAt);
            return (
              <div
                key={coupon.id}
                className={`p-5 rounded-2xl border border-border bg-card flex flex-col justify-between gap-4 transition-all hover:shadow-md ${
                  expired || !coupon.isActive ? "opacity-60" : ""
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-mono font-black text-lg tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-xl">
                        {coupon.code}
                      </span>
                      <p className="text-xs text-muted-foreground pt-1.5 font-medium">
                        {coupon.discountType === "PERCENT"
                          ? `${coupon.discountValue}% Off total menu order`
                          : `₹${coupon.discountValue.toFixed(2)} Off total menu order`}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      {expired ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3 text-rose-500" /> Expired
                        </span>
                      ) : coupon.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {coupon.expiresAt && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Expires on {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={deletingId === coupon.id}
                    onClick={() => handleDelete(coupon.id)}
                    className="p-2 rounded-xl border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    title="Delete Coupon"
                  >
                    {deletingId === coupon.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold">Create New Coupon</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Uppercase letters and numbers only, no spaces.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "PERCENT" | "FIXED",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    <option value="PERCENT">Percent (%)</option>
                    <option value="FIXED">Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder={formData.discountType === "PERCENT" ? "10" : "50.00"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                  Activate Coupon immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-5 py-2 rounded-xl text-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
