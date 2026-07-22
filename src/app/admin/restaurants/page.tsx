"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Loader2, 
  Search, 
  User as UserIcon, 
  SlidersHorizontal, 
  Calendar, 
  Trash2, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle,
  Eye
} from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  isActive: boolean;
  isSuspended: boolean;
  isDeleted: boolean;
  createdAt: string;
  planName: string;
  planStatus: string;
  trialEndDate: string | null;
  planExpiresAt: string | null;
  showTrialBanner: boolean;
  showOfferBanner: boolean;
  owner: {
    name: string;
    email: string;
  };
  _count: {
    menuItems: number;
    qrCodes: number;
  };
}

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);

  // Edit Subscription Modal State
  const [planName, setPlanName] = useState("FREE_TRIAL");
  const [planStatus, setPlanStatus] = useState("ACTIVE");
  const [trialEndDate, setTrialEndDate] = useState("");
  const [planExpiresAt, setPlanExpiresAt] = useState("");
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [showOfferBanner, setShowOfferBanner] = useState(false);
  const [isSavingSub, setIsSavingSub] = useState(false);

  // Get months dynamically
  const getMonthsOptions = () => {
    const months = new Set<string>();
    restaurants.forEach((r) => {
      const date = new Date(r.createdAt);
      const label = date.toLocaleString("default", { month: "long", year: "numeric" });
      months.add(label);
    });
    return Array.from(months);
  };

  const exportToCSV = (dataList: Restaurant[]) => {
    const headers = ["ID", "Restaurant Name", "Slug", "Owner Name", "Owner Email", "Plan Name", "Plan Status", "Signup Date"];
    const rows = dataList.map(r => [
      r.id,
      r.name,
      r.slug,
      r.owner.name,
      r.owner.email,
      r.planName,
      r.planStatus,
      new Date(r.createdAt).toLocaleDateString()
    ]);
    
    const csvRows = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ];
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dineo_restaurants_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded successfully!");
  };

  const exportToPDF = async (dataList: Restaurant[]) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Dineo Operations - Restaurants Report", 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
    doc.text(`Filter month: ${selectedMonth === "all" ? "All Months" : selectedMonth}`, 14, 34);
    doc.text(`Total Records: ${dataList.length}`, 14, 40);
    
    doc.line(14, 45, 196, 45);
    
    let y = 52;
    dataList.forEach((r, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${r.name}`, 14, y);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Slug: /menu/${r.slug}  |  Owner: ${r.owner.name} (${r.owner.email})`, 14, y + 5);
      doc.text(`Plan: ${r.planName} (${r.planStatus})  |  Registered: ${new Date(r.createdAt).toLocaleDateString()}`, 14, y + 10);
      
      y += 18;
    });
    
    doc.save(`dineo_restaurants_report_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF report downloaded successfully!");
  };

  const fetchRestaurants = () => {
    setIsLoading(true);
    fetch(`/api/admin/restaurants?includeDeleted=${includeDeleted}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRestaurants(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRestaurants();
  }, [includeDeleted]);

  const handleAction = async (id: string, action: "suspend" | "activate" | "delete" | "restore") => {
    try {
      const res = await fetch(`/api/admin/restaurants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Action failed");
      }
      toast.success(`Restaurant successfully updated`);
      fetchRestaurants();
    } catch (err: any) {
      toast.error(err.message || "Failed to update restaurant");
    }
  };

  const handleEditSubscription = (rest: Restaurant) => {
    setSelectedRest(rest);
    setPlanName(rest.planName);
    setPlanStatus(rest.planStatus);
    setTrialEndDate(rest.trialEndDate ? new Date(rest.trialEndDate).toISOString().split("T")[0] : "");
    setPlanExpiresAt(rest.planExpiresAt ? new Date(rest.planExpiresAt).toISOString().split("T")[0] : "");
    setShowTrialBanner(rest.showTrialBanner);
    setShowOfferBanner(rest.showOfferBanner);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRest) return;

    setIsSavingSub(true);
    try {
      const res = await fetch(`/api/admin/restaurants/${selectedRest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName,
          planStatus,
          trialEndDate: trialEndDate || null,
          planExpiresAt: planExpiresAt || null,
          showTrialBanner,
          showOfferBanner,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update");
      }

      toast.success("Subscription updated successfully");
      setSelectedRest(null);
      fetchRestaurants();
    } catch (err: any) {
      toast.error(err.message || "Failed to save subscription");
    } finally {
      setIsSavingSub(false);
    }
  };

  const filtered = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.email.toLowerCase().includes(search.toLowerCase());
      
    if (selectedMonth === "all") return matchesSearch;
    
    const date = new Date(r.createdAt);
    const monthLabel = date.toLocaleString("default", { month: "long", year: "numeric" });
    return matchesSearch && monthLabel === selectedMonth;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Restaurant Operations</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage tenant accounts, subscriptions, & toggle restrictions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIncludeDeleted(!includeDeleted)}
            className={`border-zinc-850 hover:bg-zinc-900 transition-all ${includeDeleted ? "bg-red-955/20 text-red-400 border-red-500/30 hover:bg-red-950/20" : "text-zinc-400"}`}
          >
            {includeDeleted ? "Hiding Deleted" : "Show Deleted Archive"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500" />
          <Input
            placeholder="Search by restaurant name, owner, or email address..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900/40 border-zinc-800 focus:border-red-500/50 focus:ring-red-500/20 text-zinc-100 placeholder:text-zinc-650"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold px-3 py-2.5 rounded-xl outline-hidden focus:ring-2 focus:ring-red-500/30"
          >
            <option value="all">All Months</option>
            {getMonthsOptions().map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <Button
            onClick={() => exportToCSV(filtered)}
            variant="outline"
            size="sm"
            className="border-zinc-800 hover:bg-zinc-850 hover:text-zinc-100 text-zinc-300 text-xs font-semibold h-9 rounded-xl"
          >
            CSV
          </Button>

          <Button
            onClick={() => exportToPDF(filtered)}
            variant="outline"
            size="sm"
            className="border-zinc-800 hover:bg-zinc-850 hover:text-zinc-100 text-zinc-300 text-xs font-semibold h-9 rounded-xl"
          >
            PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-zinc-900/20 border-zinc-800/80 p-12 text-center">
          <CardContent className="text-zinc-500">No restaurants matching the criteria.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filtered.map((rest) => {
            const isSusp = rest.isSuspended;
            const isDel = rest.isDeleted;
            return (
              <Card 
                key={rest.id} 
                className={`
                  bg-zinc-900/40 border-zinc-800/80 backdrop-blur-sm shadow-xl transition-all duration-200
                  ${isSusp ? "border-amber-900/30 bg-amber-955/5" : ""}
                  ${isDel ? "border-red-900/30 bg-red-955/5 opacity-70" : ""}
                `}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Restaurant Primary Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-zinc-100">{rest.name}</h2>
                        {isDel && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400">
                            Soft Deleted
                          </span>
                        )}
                        {isSusp && !isDel && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                            Suspended
                          </span>
                        )}
                        {!isSusp && !isDel && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            Active
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {rest.planName}
                        </span>
                      </div>
                      
                      <div className="grid gap-2 text-sm text-zinc-400 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-zinc-650" />
                          <span>Owner: {rest.owner.name} ({rest.owner.email})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-zinc-650" />
                          <span>Created: {new Date(rest.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-zinc-650" />
                          <span>Menu Items: {rest._count.menuItems} | QRs: {rest._count.qrCodes}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-zinc-650" />
                          <span>Slug: <a href={`/menu/${rest.slug}`} target="_blank" rel="noreferrer" className="text-red-400 hover:underline">/menu/{rest.slug}</a></span>
                        </div>
                      </div>

                      {/* Subscription Info */}
                      <div className="mt-4 p-3 bg-zinc-950/60 rounded-lg border border-zinc-850 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="text-zinc-500">Plan Meta</div>
                          <div className="text-zinc-300 font-medium">Status: {rest.planStatus}</div>
                        </div>
                        {rest.trialEndDate && (
                          <div className="space-y-1">
                            <div className="text-zinc-500">Trial Expiration</div>
                            <div className="text-zinc-300 font-medium">{new Date(rest.trialEndDate).toLocaleDateString()}</div>
                          </div>
                        )}
                        {rest.planExpiresAt && (
                          <div className="space-y-1">
                            <div className="text-zinc-500">Billing Term</div>
                            <div className="text-zinc-300 font-medium">{new Date(rest.planExpiresAt).toLocaleDateString()}</div>
                          </div>
                        )}
                        <Button 
                          onClick={() => handleEditSubscription(rest)} 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs px-2.5 h-7"
                        >
                          Modify Subscription
                        </Button>
                      </div>
                    </div>

                    {/* Quick Access Control Console */}
                    <div className="flex flex-row lg:flex-col items-center gap-2.5 justify-end lg:w-44 border-t lg:border-t-0 lg:border-l border-zinc-800/80 pt-4 lg:pt-0 lg:pl-6">
                      {isDel ? (
                        <Button
                          onClick={() => handleAction(rest.id, "restore")}
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2 text-zinc-300 border-zinc-800 hover:bg-zinc-850 text-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore Tenant
                        </Button>
                      ) : (
                        <>
                          {isSusp ? (
                            <Button
                              onClick={() => handleAction(rest.id, "activate")}
                              variant="outline"
                              size="sm"
                              className="w-full flex items-center justify-center gap-2 text-emerald-400 border-emerald-950/20 hover:bg-emerald-950/10 text-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Unsuspend Menu
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleAction(rest.id, "suspend")}
                              variant="outline"
                              size="sm"
                              className="w-full flex items-center justify-center gap-2 text-amber-400 border-amber-950/20 hover:bg-amber-950/10 text-xs"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Suspend Menu
                            </Button>
                          )}
                          <Button
                            onClick={() => handleAction(rest.id, "delete")}
                            variant="destructive"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 bg-red-950/40 border border-red-800/30 hover:bg-red-900/30 text-red-400 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Soft Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Subscription Dialog Modal */}
      <Dialog open={!!selectedRest} onOpenChange={() => setSelectedRest(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-150">Modify Subscription Model</DialogTitle>
          </DialogHeader>
          {selectedRest && (
            <form onSubmit={handleSaveSubscription} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Subscription Tier</label>
                <select
                  value={planName}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPlanName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-red-500/50"
                >
                  <option value="STARTER" className="bg-zinc-900 text-zinc-100">Starter Plan</option>
                  <option value="PRO" className="bg-zinc-900 text-zinc-100">Professional Plan</option>
                  <option value="ENTERPRISE" className="bg-zinc-900 text-zinc-100">Enterprise Plan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Subscription Status</label>
                <select
                  value={planStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPlanStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-red-500/50"
                >
                  <option value="ACTIVE" className="bg-zinc-900 text-zinc-100">Active</option>
                  <option value="EXPIRED" className="bg-zinc-900 text-zinc-100">Expired</option>
                  <option value="SUSPENDED" className="bg-zinc-900 text-zinc-100">Suspended</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Trial End Date (Optional)</label>
                <Input
                  type="date"
                  value={trialEndDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrialEndDate(e.target.value)}
                  className="bg-zinc-955 border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Plan Expiry Date (Optional)</label>
                <Input
                  type="date"
                  value={planExpiresAt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlanExpiresAt(e.target.value)}
                  className="bg-zinc-955 border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-400 uppercase">Dashboard Promotion Banners</label>
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-zinc-800 bg-zinc-950/40 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTrialBanner}
                      onChange={(e) => setShowTrialBanner(e.target.checked)}
                      className="rounded text-red-500 bg-zinc-900 border-zinc-800 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>Show Free Trial Expiry Banner</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-zinc-800 bg-zinc-950/40 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOfferBanner}
                      onChange={(e) => setShowOfferBanner(e.target.checked)}
                      className="rounded text-red-500 bg-zinc-900 border-zinc-800 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>Show Special Offers Banner</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedRest(null)}
                  className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  Discard
                </Button>
                <Button 
                  type="submit" 
                  className="bg-red-650 hover:bg-red-700 text-zinc-100 font-semibold"
                  disabled={isSavingSub}
                >
                  {isSavingSub ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
