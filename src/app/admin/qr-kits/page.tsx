"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import * as QRCodeLib from "qrcode";
import * as htmlToImage from "html-to-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  XCircle,
  Download,
  Building2,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  restaurantSlug: string | null;
  qrColor: string;
}

const colorOptions: Record<string, { gradient: string; hex: string }> = {
  orange: { gradient: "from-orange-500 via-amber-500 to-amber-600", hex: "#ea580c" },
  black: { gradient: "from-zinc-800 via-neutral-900 to-black", hex: "#000000" },
  blue: { gradient: "from-blue-500 via-cyan-500 to-blue-600", hex: "#2563eb" },
  purple: { gradient: "from-purple-500 via-violet-500 to-purple-600", hex: "#7c3aed" },
  dark: { gradient: "from-slate-800 via-slate-900 to-black", hex: "#0f172a" },
  emerald: { gradient: "from-emerald-500 via-teal-500 to-emerald-600", hex: "#059669" },
  rose: { gradient: "from-rose-500 via-pink-500 to-rose-600", hex: "#e11d48" },
  gold: { gradient: "from-amber-400 via-yellow-500 to-amber-600", hex: "#d97706" },
  red: { gradient: "from-red-500 via-rose-600 to-red-650", hex: "#dc2626" },
};

export default function AdminQRKitsPage() {
  const [requests, setRequests] = useState<QRKitRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Poster Generation State
  const [activeRequest, setActiveRequest] = useState<QRKitRequest | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRequest?.restaurantSlug) {
      const requestedColor = activeRequest.qrColor || "orange";
      const hexColor = colorOptions[requestedColor]?.hex || colorOptions.orange.hex;

      const canvas = document.createElement("canvas");
      QRCodeLib.toCanvas(canvas, `${window.location.origin}/menu/${activeRequest.restaurantSlug}`, {
        width: 1024,
        margin: 1,
        color: {
          dark: hexColor,
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      })
        .then(() => {
          setDataUrl(canvas.toDataURL("image/png"));
        })
        .catch((err) => console.error("QR Error", err));
    }
  }, [activeRequest]);

  const handleDownloadPNG = async () => {
    if (!printRef.current || !activeRequest) return;
    try {
      const el = printRef.current;
      const image = await htmlToImage.toPng(el, {
        pixelRatio: 3,
        width: el.offsetWidth,
        height: el.offsetHeight,
        style: { transform: 'none', margin: '0' },
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.href = image;
      link.download = `${activeRequest.restaurantSlug}-poster.png`;
      link.click();
      toast.success("Downloaded HD Poster successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate poster");
    }
  };

  const fetchRequests = () => {
    setIsLoading(true);
    fetch("/api/admin/qr-kits")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRequests(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/qr-kits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      toast.success("QR Kit request status updated");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">Pending</span>;
      case "CONTACTED":
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-650 dark:text-blue-400">Contacted</span>;
      case "IN_PROGRESS":
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-650 dark:text-purple-400">In Progress</span>;
      case "COMPLETED":
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">Completed</span>;
      case "CANCELLED":
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">Cancelled</span>;
      default:
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">QR Stands & Kits Leads</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Manage physical merchandise orders and sales pipelines.</p>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="bg-white dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800/80 p-12 text-center shadow-sm">
          <CardContent className="text-zinc-500">No QR Kit requests recorded yet.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <Card key={req.id} className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 backdrop-blur-sm shadow-sm dark:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Lead Info */}
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{req.restaurantName}</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">Contact: {req.contactPerson}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(req.status)}
                        {req.qrColor && (
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-white bg-gradient-to-br ${colorOptions[req.qrColor]?.gradient || colorOptions.orange.gradient}`}>
                            {req.qrColor} Theme
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm text-zinc-600 dark:text-zinc-400 md:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                        <span className="truncate">{req.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                        <span>{req.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                        <MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                        <span className="truncate">{req.address}, {req.city}, {req.state} - {req.pincode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                        <span>Qty: {req.quantityNeeded} (Tables: {req.tableCount})</span>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded border border-zinc-150 dark:border-zinc-850 text-xs text-zinc-650 dark:text-zinc-400">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-300 block mb-1">Owner Notes:</span>
                        {req.notes}
                      </div>
                    )}

                    {req.restaurantSlug ? (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-850 text-xs space-y-3.5">
                        <div className="space-y-1">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 block">Print QR Target URL:</span>
                          <span className="text-zinc-600 dark:text-zinc-500 font-mono select-all bg-zinc-100/70 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-900 block truncate">
                            {window.location.origin}/menu/{req.restaurantSlug}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/menu/${req.restaurantSlug}`);
                              toast.success("Copied to clipboard!");
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 flex-1 cursor-pointer font-semibold"
                          >
                            Copy Link
                          </Button>
                          <button
                            onClick={() => setActiveRequest(req)}
                            className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3 rounded-lg flex-1 cursor-pointer transition-colors"
                          >
                            Generate HD Poster
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/20 rounded border border-zinc-200 dark:border-zinc-850 border-dashed text-xs text-zinc-500 italic">
                        ⚠️ No registered restaurant matches this request name or email.
                      </div>
                    )}
                  </div>

                  {/* Lead Management Control Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center gap-2 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-855 pt-4 lg:pt-0 lg:pl-6 lg:w-44 justify-end">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 lg:block hidden mb-1 self-start">Update Status</span>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 w-full">
                      <Button
                        onClick={() => handleStatusChange(req.id, "CONTACTED")}
                        variant="outline"
                        size="sm"
                        disabled={req.status === "CONTACTED"}
                        className="w-full text-xs h-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-200 font-semibold"
                      >
                        <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />
                        Contacted
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(req.id, "IN_PROGRESS")}
                        variant="outline"
                        size="sm"
                        disabled={req.status === "IN_PROGRESS"}
                        className="w-full text-xs h-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-855 text-zinc-700 dark:text-zinc-200 font-semibold"
                      >
                        <TrendingUp className="w-3.5 h-3.5 mr-1 text-purple-500" />
                        In Progress
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(req.id, "COMPLETED")}
                        variant="outline"
                        size="sm"
                        disabled={req.status === "COMPLETED"}
                        className="w-full text-xs h-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-855 text-zinc-700 dark:text-zinc-200 font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500 dark:text-emerald-400" />
                        Complete
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(req.id, "CANCELLED")}
                        variant="outline"
                        size="sm"
                        disabled={req.status === "CANCELLED"}
                        className="w-full text-xs h-8 border-zinc-200 dark:border-zinc-850 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900/30 font-semibold"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1 text-red-500" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Admin QR Poster Generator Modal */}
      <Dialog open={!!activeRequest} onOpenChange={(open) => !open && setActiveRequest(null)}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle>Restaurant HD Poster</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 mt-4">
            <div
              id="printable-qr-poster"
              ref={printRef}
              className={`bg-gradient-to-br ${activeRequest?.qrColor && colorOptions[activeRequest.qrColor] ? colorOptions[activeRequest.qrColor].gradient : colorOptions.orange.gradient} p-8 rounded-3xl text-white shadow-xl max-w-[320px] w-full flex flex-col items-center justify-center`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-6 w-6" />
                <h2 className="text-2xl font-extrabold tracking-tight">
                  {activeRequest?.restaurantName}
                </h2>
              </div>
              <p className="text-xs text-white/90 font-medium mb-6">
                Scan with any phone camera to view menu
              </p>

              <div className="bg-white p-4 rounded-2xl shadow-2xl mb-4">
                {dataUrl ? (
                  <img src={dataUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-muted-foreground">
                    Generating...
                  </div>
                )}
              </div>

              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase border border-white/30">
                ⚡ Powered by Dineo
              </div>
            </div>

            <Button
              onClick={handleDownloadPNG}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl mt-4"
            >
              <Download className="w-4 h-4 mr-2" /> Download High-Res PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
