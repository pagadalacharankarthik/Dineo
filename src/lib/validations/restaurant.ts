import { z } from "zod";

export const restaurantSchema = z.object({
  name: z
    .string()
    .min(1, "Restaurant name is required")
    .max(150, "Name must be less than 150 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  logo: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().startsWith("/"))
    .or(z.string().startsWith("data:image/"))
    .optional()
    .or(z.literal("")),
  coverImage: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().startsWith("/"))
    .or(z.string().startsWith("data:image/"))
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(300, "Address must be less than 300 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "City must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .max(100, "State must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(100, "Country must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  pincode: z
    .string()
    .max(10, "Pincode must be less than 10 characters")
    .optional()
    .or(z.literal("")),
  mobile: z
    .string()
    .max(20, "Mobile must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal("")),
  instagram: z
    .string()
    .max(100, "Instagram handle must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  facebook: z
    .string()
    .max(100, "Facebook handle must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  openingTime: z
    .string()
    .max(20, "Invalid time format")
    .optional()
    .or(z.literal("")),
  closingTime: z
    .string()
    .max(20, "Invalid time format")
    .optional()
    .or(z.literal("")),
  googleReviewUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type RestaurantInput = z.infer<typeof restaurantSchema>;
