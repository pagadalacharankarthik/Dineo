import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(15, "Coupon code must be at most 15 characters")
    .regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric (no spaces or special chars)"),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.number().positive("Discount value must be greater than zero"),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
}).refine((data) => {
  if (data.discountType === "PERCENT" && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"],
});

export type CouponInput = z.infer<typeof couponSchema>;
