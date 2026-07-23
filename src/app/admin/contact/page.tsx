"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Loader2, 
  Mail, 
  Phone, 
  Store, 
  Calendar, 
  CheckSquare, 
  Square,
  MessageSquare,
  BadgeAlert,
  ArrowRightCircle,
  Archive
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContactEnquiry {
  id: string;
  name: string;
  restaurantName: string | null;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  status: string;
  createdAt: string;
}

export default function AdminContactPage() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEnquiries = () => {
    setIsLoading(true);
    fetch("/api/admin/contact")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEnquiries(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !currentRead, status: "NEW" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update");
      }
      toast.success(currentRead ? "Marked as unread" : "Marked as read");
      fetchEnquiries();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, isRead: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      toast.success(`Enquiry marked as ${status.toLowerCase()}`);
      fetchEnquiries();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status: string, isRead: boolean) => {
    if (!isRead) {
      return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400">Unread</span>;
    }
    switch (status) {
      case "NEW":
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">New</span>;
      case "REPLIED":
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-650 dark:text-blue-400">Replied</span>;
      case "CLOSED":
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-450 border border-zinc-200 dark:border-zinc-700">Closed</span>;
      default:
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">Customer Support Inquiries</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Review contact form inquiries, support queries, and custom leads.</p>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : enquiries.length === 0 ? (
        <Card className="bg-white dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800/80 p-12 text-center shadow-sm">
          <CardContent className="text-zinc-500">No support enquiries found.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {enquiries.map((enq) => (
            <Card 
              key={enq.id} 
              className={`
                bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 backdrop-blur-sm shadow-sm dark:shadow-xl transition-all duration-200
                ${!enq.isRead ? "border-l-2 border-l-red-550" : ""}
              `}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Lead Info */}
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{enq.name}</h2>
                        {enq.restaurantName && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                            <Store className="w-3.5 h-3.5" />
                            <span>{enq.restaurantName}</span>
                          </div>
                        )}
                      </div>
                      <div>{getStatusBadge(enq.status, enq.isRead)}</div>
                    </div>

                    {/* Email/Phone/Date Row */}
                    <div className="grid gap-2 text-sm text-zinc-650 dark:text-zinc-400 md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-650" />
                        <span className="truncate">{enq.email}</span>
                      </div>
                      {enq.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-zinc-400 dark:text-zinc-650" />
                          <span>{enq.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-650" />
                        <span>{new Date(enq.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Message Box */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded border border-zinc-150 dark:border-zinc-850 flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-zinc-400 dark:text-zinc-650 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-zinc-750 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {enq.message}
                      </p>
                    </div>
                  </div>

                  {/* Actions Console */}
                  <div className="flex flex-row lg:flex-col items-center gap-2.5 justify-end lg:w-44 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-850 pt-4 lg:pt-0 lg:pl-6">
                    <Button
                      onClick={() => handleToggleRead(enq.id, enq.isRead)}
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs h-8.5 font-semibold"
                    >
                      {enq.isRead ? (
                        <>
                          <Square className="w-3.5 h-3.5" />
                          Mark Unread
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          Mark Read
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleStatusChange(enq.id, "REPLIED")}
                      variant="outline"
                      size="sm"
                      disabled={enq.status === "REPLIED"}
                      className="w-full flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs h-8.5 font-semibold"
                    >
                      <ArrowRightCircle className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      Mark Replied
                    </Button>

                    <Button
                      onClick={() => handleStatusChange(enq.id, "CLOSED")}
                      variant="outline"
                      size="sm"
                      disabled={enq.status === "CLOSED"}
                      className="w-full flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs h-8.5 font-semibold"
                    >
                      <Archive className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-550" />
                      Close Enquiry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
