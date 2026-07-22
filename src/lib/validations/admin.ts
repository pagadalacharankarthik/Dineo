import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const restaurantStatusSchema = z.object({
  action: z.enum(["suspend", "activate", "delete", "restore"]),
});

export const qrKitStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "CONTACTED", "IN_PROGRESS", "COMPLETED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(["NEW", "REPLIED", "CLOSED"]),
  isRead: z.boolean().optional(),
});

export const changeAdminPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Minimum 8 characters"),
});
