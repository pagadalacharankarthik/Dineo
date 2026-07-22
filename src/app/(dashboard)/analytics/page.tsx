"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  ScanLine,
  Calendar,
  Smartphone,
  Globe,
  Monitor,
  MapPin,
  Tag,
  UtensilsCrossed,
  Download,
  Loader2,
} from "lucide-react";

interface AnalyticsData {
  scans: {
    total: number;
    today: number;
    weekly: number;
    monthly: number;
  };
  devices: { name: string; value: number }[];
  browsers: { name: string; value: number }[];
  operatingSystems: { name: string; value: number }[];
  locations: { country: string; city: string; value: number }[];
  mostViewedCategories: { id: string; name: string; viewsCount: number }[];
  mostViewedItems: { id: string; name: string; viewsCount: number; price: number }[];
  qrDownloads: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/dashboard/analytics");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load analytics. Please try again.</p>
      </div>
    );
  }

  // Helper to find percentage
  const getPercentage = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  const totalScans = data.scans.total;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary animate-pulse" /> Live QR Analytics
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track customer engagement, popular items, and scan frequencies.
        </p>
      </div>

      {/* Scans Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today */}
        <div className="p-6 rounded-2xl border border-border bg-card flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today&apos;s Scans</p>
            <p className="text-3xl font-extrabold mt-1">{data.scans.today}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500 flex items-center justify-center">
            <ScanLine className="h-6 w-6" />
          </div>
        </div>

        {/* Weekly */}
        <div className="p-6 rounded-2xl border border-border bg-card flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last 7 Days</p>
            <p className="text-3xl font-extrabold mt-1">{data.scans.weekly}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        {/* Monthly */}
        <div className="p-6 rounded-2xl border border-border bg-card flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last 30 Days</p>
            <p className="text-3xl font-extrabold mt-1">{data.scans.monthly}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-500 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        {/* Total Scans */}
        <div className="p-6 rounded-2xl border border-border bg-card flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">All-Time Scans</p>
            <p className="text-3xl font-extrabold mt-1">{totalScans}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <ScanLine className="h-6 w-6 animate-ping-slow" />
          </div>
        </div>
      </div>

      {/* Traffic breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Device Types */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-bold text-base flex items-center gap-2 mb-4">
            <Smartphone className="h-5 w-5 text-primary" /> Device Breakdown
          </h2>
          {data.devices.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data available yet</p>
          ) : (
            <div className="space-y-4">
              {data.devices.map((device) => (
                <div key={device.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{device.name}</span>
                    <span className="text-muted-foreground">{device.value} ({getPercentage(device.value, totalScans)})</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: getPercentage(device.value, totalScans) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operating Systems */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-bold text-base flex items-center gap-2 mb-4">
            <Monitor className="h-5 w-5 text-primary" /> Operating Systems
          </h2>
          {data.operatingSystems.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data available yet</p>
          ) : (
            <div className="space-y-4">
              {data.operatingSystems.map((os) => (
                <div key={os.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{os.name}</span>
                    <span className="text-muted-foreground">{os.value} ({getPercentage(os.value, totalScans)})</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: getPercentage(os.value, totalScans) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Browsers */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-bold text-base flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" /> Browsers Used
          </h2>
          {data.browsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data available yet</p>
          ) : (
            <div className="space-y-4">
              {data.browsers.map((b) => (
                <div key={b.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{b.name}</span>
                    <span className="text-muted-foreground">{b.value} ({getPercentage(b.value, totalScans)})</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: getPercentage(b.value, totalScans) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Categories */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-bold text-base flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-primary" /> Most Viewed Categories
          </h2>
          {data.mostViewedCategories.length === 0 ? (
            <p className="text-xs text-muted-foreground">No category views recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.mostViewedCategories.map((cat, idx) => (
                <div key={cat.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}.</span>
                    <span className="text-sm font-semibold">{cat.name}</span>
                  </div>
                  <span className="text-xs font-extrabold bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                    {cat.viewsCount} views
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Viewed Menu Items */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-bold text-base flex items-center gap-2 mb-4">
            <UtensilsCrossed className="h-5 w-5 text-primary" /> Most Viewed Menu Items
          </h2>
          {data.mostViewedItems.length === 0 ? (
            <p className="text-xs text-muted-foreground">No menu item views recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.mostViewedItems.map((item, idx) => (
                <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}.</span>
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg">
                    {item.viewsCount} views
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Locations breakdown */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h2 className="font-bold text-base flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" /> Scans by Location
        </h2>
        {data.locations.length === 0 ? (
          <p className="text-xs text-muted-foreground">No location scans recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.locations.map((loc) => (
              <div key={`${loc.country}-${loc.city}`} className="p-4 rounded-xl border border-border bg-muted/35 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">{loc.city}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">{loc.country}</p>
                </div>
                <span className="text-sm font-black text-primary">
                  {loc.value} {loc.value === 1 ? "scan" : "scans"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
