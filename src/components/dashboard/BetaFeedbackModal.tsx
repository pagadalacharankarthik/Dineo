"use client";

import React, { useState } from "react";
import { X, Star, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export function BetaFeedbackModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: BetaFeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackType, setFeedbackType] = useState<string>("General Experience");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating!");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Please write a message (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          type: feedbackType,
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast.success("Thank you for your valuable feedback!");
        setTimeout(() => {
          onSubmitSuccess();
          onClose();
          // Reset states
          setRating(0);
          setMessage("");
          setSubmitted(false);
        }, 2200);
      } else {
        toast.error(data.error || "Failed to submit feedback");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 text-left align-middle shadow-2xl transition-all duration-300 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground rounded-full p-1 hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black">Feedback Sent!</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Your feedback has been successfully delivered to the Dineo product team. We appreciate your support during our Beta!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                <Sparkles className="h-3 w-3" /> Beta Feedback Form
              </div>
              <h3 className="text-lg font-black leading-6 text-foreground pt-1">
                How has your experience been?
              </h3>
              <p className="text-xs text-muted-foreground">
                Help us improve Dineo during our initial launch. Let us know what you like or any issues you encountered!
              </p>
            </div>

            {/* Star Rating Select */}
            <div className="space-y-2 text-center py-2 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-border/55">
              <span className="block text-xs font-bold text-muted-foreground">
                Select Star Rating
              </span>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-300 dark:text-zinc-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Type Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                Feedback Category
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
              >
                <option value="General Experience">General Experience</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other Issues</option>
              </select>
            </div>

            {/* Feedback Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                Tell us more details
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="What did you like? What was confusing? Type your response here..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none placeholder:text-muted-foreground/60"
              />
              <span className="block text-[10px] text-muted-foreground text-right mt-1">
                {message.length} characters (min. 10)
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Beta Feedback"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
