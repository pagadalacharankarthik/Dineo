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
  scanTrend: { date: string; count: number }[];
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

  const trend = data.scanTrend || [];
  const maxCount = Math.max(...trend.map((t) => t.count), 5);

  const width = 500;
  const height = 180;
  const paddingLeft = 30;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = trend.map((val, idx) => {
    const x = paddingLeft + (idx / (Math.max(trend.length - 1, 1))) * chartWidth;
    const y = paddingTop + chartHeight - (val.count / maxCount) * chartHeight;
    return { x, y, date: val.date, count: val.count };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? "M" : " L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, "");

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`
    : "";

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

      {/* Scan Trend Chart */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary animate-pulse" /> Scan Frequency Trend
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Scans tracked daily for the past 7 days</p>
          </div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Last 7 Days
          </span>
        </div>

        <div className="w-full h-48 relative pt-2">
          {trend.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              No trend data available.
            </div>
          ) : (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingTop + ratio * chartHeight;
                const value = Math.round(maxCount * (1 - ratio));
                return (
                  <g key={ratio} className="opacity-40">
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-border"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      className="fill-muted-foreground font-semibold"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              {areaD && (
                <path d={areaD} fill="url(#chartGradient)" />
              )}

              {/* Line Stroke */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interaction points / labels */}
              {points.map((p, idx) => (
                <g key={idx} className="group/point">
                  {/* Point Marker */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#f97316"
                    className="stroke-card stroke-2 transition-all group-hover/point:r-5"
                  />
                  {/* Invisible larger hover circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill="transparent"
                    className="cursor-pointer"
                  />
                  {/* Date labels at bottom */}
                  <text
                    x={p.x}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="9"
                    className="fill-muted-foreground font-semibold"
                  >
                    {p.date}
                  </text>
                  {/* Tooltip / Value on top of dot on hover */}
                  <g className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-150 pointer-events-none">
                    <rect
                      x={p.x - 18}
                      y={p.y - 22}
                      width="36"
                      height="16"
                      rx="4"
                      className="fill-zinc-900 dark:fill-zinc-100"
                    />
                    <text
                      x={p.x}
                      y={p.y - 11}
                      textAnchor="middle"
                      fontSize="8"
                      className="fill-zinc-100 dark:fill-zinc-900 font-extrabold"
                    >
                      {p.count}
                    </text>
                  </g>
                </g>
              ))}
            </svg>
          )}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Scans by Location
          </h2>
          <span className="text-[10px] text-muted-foreground font-medium">
            (Estimated by network IP routing; ISP gateways may map to regional hubs like Mumbai)
          </span>
        </div>
        {data.locations.length === 0 ? (
          <p className="text-xs text-muted-foreground">No location scans recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.locations.map((loc) => (
              <div key={`${loc.country}-${loc.city}`} className="p-4 rounded-xl border border-border bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between min-w-0">
                <div className="flex flex-col min-w-0 pr-2">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{loc.city}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{loc.country}</p>
                </div>
                <span className="text-sm font-extrabold text-orange-500 whitespace-nowrap shrink-0">
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
