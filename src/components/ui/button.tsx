import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
          // Variants
          variant === "default" && "bg-primary text-primary-foreground hover:opacity-90 shadow-md",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
          variant === "outline" && "border border-input bg-transparent hover:bg-muted text-foreground",
          variant === "ghost" && "hover:bg-muted text-muted-foreground hover:text-foreground",
          // Sizes
          size === "default" && "h-10 px-4 py-2.5",
          size === "sm" && "h-9 px-3 text-xs",
          size === "lg" && "h-11 px-8",
          size === "icon" && "h-10 w-10",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
