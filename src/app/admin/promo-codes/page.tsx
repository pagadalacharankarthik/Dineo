"use client";

import { useEffect, useState } from "react";
import { 
  Tag, 
  Plus, 
  Trash2, 
  Calendar, 
  Check, 
  X, 
  Percent, 
  CreditCard,
  Loader2,
  Ticket
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PromoCode {
  id: string;
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promo-codes");
      const json = await res.json();
      if (json.success) {
        setPromoCodes(json.data);
      } else {
        toast.error(json.error || "Failed to load promo codes");
      }
    } catch (err) {
      toast.error("Failed to connect to database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      toast.error("Please fill in code and discount value");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: Number(discountValue),
          expiresAt: expiresAt || null,
          isActive,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Promo code created successfully!");
        setCode("");
        setDiscountValue("");
        setExpiresAt("");
        setIsActive(true);
        fetchPromoCodes();
      } else {
        toast.error(json.error || "Failed to create promo code");
      }
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Promo code ${!currentStatus ? "activated" : "deactivated"} successfully`);
        setPromoCodes(prev =>
          prev.map(p => (p.id === id ? { ...p, isActive: !currentStatus } : p))
        );
      } else {
        toast.error(json.error || "Failed to update status");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;

    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Promo code deleted successfully");
        setPromoCodes(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error(json.error || "Failed to delete promo code");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
          <Ticket className="h-8 w-8 text-red-500" /> Promo Code Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create and manage promotional discount codes for merchant physical QR Kit shipping requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Creation Form */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-lg">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-red-500" /> Create Promo Code
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="promo-code" className="block text-xs font-semibold mb-1.5 uppercase text-zinc-500">
                Promo Code
              </label>
              <input
                id="promo-code"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. STARTER50"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 uppercase font-bold tracking-wider"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase text-zinc-500">
                Discount Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType("PERCENT")}
                  className={`py-2 px-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    discountType === "PERCENT"
                      ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950"
                  }`}
                >
                  <Percent className="w-4 h-4" /> Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("FLAT")}
                  className={`py-2 px-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    discountType === "FLAT"
                      ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950"
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Flat (₹)
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="promo-value" className="block text-xs font-semibold mb-1.5 uppercase text-zinc-500">
                Discount Value {discountType === "PERCENT" ? "(%)" : "(₹)"}
              </label>
              <input
                id="promo-value"
                type="number"
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                placeholder={discountType === "PERCENT" ? "e.g. 20" : "e.g. 500"}
                min="1"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="promo-expiry" className="block text-xs font-semibold mb-1.5 uppercase text-zinc-500">
                Expiry Date (Optional)
              </label>
              <input
                id="promo-expiry"
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-zinc-700 dark:text-zinc-300"
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                id="promo-active"
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="promo-active" className="text-sm font-semibold select-none text-zinc-700 dark:text-zinc-300">
                Make code active immediately
              </label>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all duration-200"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Creating..." : "Create Promo Code"}
            </Button>
          </form>
        </div>

        {/* Promo Codes Table List */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-lg">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-red-500" /> Active Promo Codes ({promoCodes.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading promo codes...
            </div>
          ) : promoCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <Ticket className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
              <p className="text-muted-foreground font-semibold">No promo codes found</p>
              <p className="text-xs text-muted-foreground mt-1">Create one using the form on the left</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-400 uppercase">
                    <th className="pb-3 pt-1 pl-2">Code</th>
                    <th className="pb-3 pt-1">Discount</th>
                    <th className="pb-3 pt-1">Expiry Date</th>
                    <th className="pb-3 pt-1 text-center">Status</th>
                    <th className="pb-3 pt-1 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                  {promoCodes.map((promo) => {
                    const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
                    return (
                      <tr key={promo.id} className="text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all duration-150">
                        <td className="py-4 pl-2 font-black tracking-wider text-zinc-900 dark:text-zinc-100">
                          {promo.code}
                        </td>
                        <td className="py-4 font-semibold text-zinc-700 dark:text-zinc-300">
                          {promo.discountType === "PERCENT" ? (
                            <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-lg text-xs">
                              {promo.discountValue}% Off
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg text-xs">
                              ₹{promo.discountValue} Off
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-xs text-muted-foreground">
                          {promo.expiresAt ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(promo.expiresAt).toLocaleDateString()}
                              {isExpired && <span className="text-red-500 text-[10px] font-bold uppercase ml-1">(Expired)</span>}
                            </span>
                          ) : (
                            "Never Expires"
                          )}
                        </td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(promo.id, promo.isActive)}
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all duration-200 font-bold ${
                              promo.isActive && !isExpired
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-zinc-500/10 border-zinc-500/20 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/20"
                            }`}
                          >
                            {promo.isActive && !isExpired ? (
                              <>
                                <Check className="w-3 h-3" /> Active
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" /> Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button
                            onClick={() => handleDelete(promo.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150"
                            title="Delete Code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
