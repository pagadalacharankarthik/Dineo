"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { contactEnquirySchema, type ContactEnquiryInput } from "@/lib/validations/forms";

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactEnquiryInput>({
    resolver: zodResolver(contactEnquirySchema),
    defaultValues: {
      name: "",
      restaurantName: "",
      email: "",
      phone: "",
      message: "",
      qrColor: "orange",
    },
  });

  const selectedColor = watch("qrColor");

  const colorOptions = {
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

  const onSubmit = async (data: ContactEnquiryInput) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to submit enquiry");
      }

      toast.success("Message sent successfully! We will get back to you shortly. 🎉");
      reset();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-8 rounded-2xl border border-border bg-card shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-100">Send us a message</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              Full Name
            </label>
            <input
              id="contact-name"
              type="text"
              placeholder="Rahul Sharma"
              disabled={isSubmitting}
              {...register("name")}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <input
              id="contact-email"
              type="email"
              placeholder="rahul@sharmas.kitchen"
              disabled={isSubmitting}
              {...register("email")}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Restaurant Name */}
          <div>
            <label htmlFor="contact-restaurant" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              Restaurant Name <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
            </label>
            <input
              id="contact-restaurant"
              type="text"
              placeholder="Sharma's Kitchen"
              disabled={isSubmitting}
              {...register("restaurantName")}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.restaurantName && (
              <p className="mt-1.5 text-xs text-destructive">{errors.restaurantName.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="contact-phone" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              Phone Number <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
            </label>
            <input
              id="contact-phone"
              type="tel"
              placeholder="9876543210"
              disabled={isSubmitting}
              {...register("phone")}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50"
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Message
          </label>
          <textarea
            id="contact-message"
            rows={5}
            placeholder="Tell us more about how we can help your restaurant..."
            disabled={isSubmitting}
            {...register("message")}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-colors disabled:opacity-50"
          />
          {errors.message && (
            <p className="mt-1.5 text-xs text-destructive">{errors.message.message}</p>
          )}
        </div>

        {/* Color Selector */}
        <div className="space-y-3 pt-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" /> Preferred QR Poster Color <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
          </label>
          <div className="flex flex-wrap items-center gap-4">
            {(Object.keys(colorOptions) as Array<keyof typeof colorOptions>).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue("qrColor", color)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-sm transition-all ${
                  selectedColor === color ? "border-primary scale-110 ring-4 ring-primary/10" : "border-transparent hover:scale-105"
                } bg-gradient-to-br ${colorOptions[color].gradient}`}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              >
                {selectedColor === color && (
                  <div className="w-3 h-3 bg-white rounded-full shadow-md" />
                )}
              </button>
            ))}
            <span className="text-sm text-muted-foreground ml-2 capitalize font-medium">
              {selectedColor}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full gradient-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Sending Message..." : "Send Message"}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          We typically respond within 24 hours.
        </p>
      </form>
    </div>
  );
}
