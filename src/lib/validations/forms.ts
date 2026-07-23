import { z } from "zod";

// ─────────────────────────────────────────────
// CONTACT FORM VALIDATION
// ─────────────────────────────────────────────
export const contactEnquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  restaurantName: z.string().max(100).optional().nullable(),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(5, "Phone number must be at least 5 digits")
    .max(20, "Phone number cannot exceed 20 characters")
    .optional()
    .nullable(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  qrColor: z.string().optional().nullable(),
});

export type ContactEnquiryInput = z.infer<typeof contactEnquirySchema>;

// ─────────────────────────────────────────────
// QR KIT INTEREST REQUEST VALIDATION
// ─────────────────────────────────────────────
export const qrKitRequestSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters").max(100),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters").max(100),
  phone: z.string().min(8, "Phone number must be at least 8 digits").max(20),
  email: z.string().email("Invalid email address"),
  address: z.string().min(10, "Address must be at least 10 characters").max(300),
  city: z.string().min(2, "City must be at least 2 characters").max(50),
  state: z.string().min(2, "State must be at least 2 characters").max(50),
  pincode: z.string().min(4, "Pincode must be at least 4 digits").max(10),
  tableCount: z.number().int().min(1, "Number of tables must be at least 1"),
  quantityNeeded: z.number().int().min(1, "Quantity must be at least 1"),
  notes: z.string().max(500).optional().nullable(),
  qrColor: z.enum(["orange", "blue", "purple", "black", "dark", "emerald", "rose", "gold", "red"]).default("orange"),
});

export type QRKitRequestInput = z.infer<typeof qrKitRequestSchema>;

// ─────────────────────────────────────────────
// QR ANALYTICS INPUT VALIDATION
// ─────────────────────────────────────────────
export const qrScanSchema = z.object({
  qrCodeId: z.string().cuid("Invalid QR Code ID"),
  restaurantId: z.string().cuid("Invalid Restaurant ID"),
  deviceType: z.string().optional().nullable(),
  browser: z.string().optional().nullable(),
  os: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
  visitorId: z.string().optional().nullable(),
});

export type QRScanInput = z.infer<typeof qrScanSchema>;
