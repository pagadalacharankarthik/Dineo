"use client";

import { useEffect, useState } from "react";
import { 
  Store, 
  QrCode, 
  Mail, 
  Users, 
  TrendingUp, 
  Activity, 
  Loader2 
} from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface Stats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalUsers: number;
  totalScans: number;
  totalQRKitRequests: number;
  totalContactEnquiries: number;
  activeOffersCount: number;
  plans: {
    FREE_TRIAL: number;
    PRO: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch((err) => console.error("Error loading stats:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Restaurants",
      value: stats?.totalRestaurants || 0,
      description: `${stats?.activeRestaurants || 0} active, ${((stats?.totalRestaurants || 0) - (stats?.activeRestaurants || 0))} suspended/deleted`,
      icon: Store,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Total Registered Users",
      value: stats?.totalUsers || 0,
      description: "Platform accounts",
      icon: Users,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Total QR Scans",
      value: stats?.totalScans || 0,
      description: "Real-time menu visits",
      icon: TrendingUp,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "QR Kit Requests",
      value: stats?.totalQRKitRequests || 0,
      description: "Merchandise sales lead",
      icon: QrCode,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Support Enquiries",
      value: stats?.totalContactEnquiries || 0,
      description: "Inbound messages",
      icon: Mail,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Overview Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Platform analytics & management metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="bg-zinc-900/40 border-zinc-800/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-100">{card.value}</div>
                <p className="text-xs text-zinc-500 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Promotion Banners Overview */}
      <Card className="bg-zinc-900/40 border-zinc-800/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wider uppercase text-zinc-300">
            Active Promotion Banners Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
            <div className="space-y-0.5">
              <span className="text-zinc-400 text-sm font-medium">Free Trial Expiry Banner</span>
              <p className="text-[10px] text-zinc-550">Active on merchant dashboards</p>
            </div>
            <span className="font-bold text-amber-500 text-lg">
              {stats?.plans.FREE_TRIAL || 0}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
            <div className="space-y-0.5">
              <span className="text-zinc-400 text-sm font-medium">Special Offer Banner</span>
              <p className="text-[10px] text-zinc-550">Active on merchant dashboards</p>
            </div>
            <span className="font-bold text-emerald-500 text-lg">
              {stats?.activeOffersCount || 0}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Extra Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscriptions Overview */}
        <Card className="bg-zinc-900/40 border-zinc-800/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider uppercase text-zinc-300">
              Subscription Tiers Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
              <span className="text-zinc-400 text-sm">Free Trial</span>
              <span className="font-bold text-zinc-200">{stats?.plans.FREE_TRIAL || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
              <span className="text-zinc-400 text-sm">Pro tier</span>
              <span className="font-bold text-red-400">{stats?.plans.PRO || 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-zinc-500 pt-1">
              <span>Ready for billing engine gateway migration</span>
              <Activity className="w-3.5 h-3.5 animate-pulse text-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card className="bg-zinc-900/40 border-zinc-800/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider uppercase text-zinc-300">
              System Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
              <span className="text-zinc-400 text-sm">Database Sync</span>
              <span className="text-emerald-400 font-medium text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Operational</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
              <span className="text-zinc-400 text-sm">Auth Gateway</span>
              <span className="text-emerald-400 font-medium text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">API Services</span>
              <span className="text-emerald-400 font-medium text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
