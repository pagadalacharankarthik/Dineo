import { z } from "zod";

// ─────────────────────────────────────────────
// RESTAURANT / SLUG VALIDATION
// ─────────────────────────────────────────────
export const restaurantSlugSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional().nullable(),
  logo: z.string().url("Invalid logo URL").or(z.string().startsWith("data:image/")).or(z.string().startsWith("/")).optional().nullable(),
  coverImage: z.string().url("Invalid cover image URL").or(z.string().startsWith("data:image/")).or(z.string().startsWith("/")).optional().nullable(),
  address: z.string().max(250).optional().nullable(),
  mobile: z.string().max(20).optional().nullable(),
  openingTime: z.string().max(20).optional().nullable(),
  closingTime: z.string().max(20).optional().nullable(),
});

export type RestaurantSlugInput = z.infer<typeof restaurantSlugSchema>;

// ─────────────────────────────────────────────
// CATEGORY VALIDATION
// ─────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(50),
  description: z.string().max(200).optional().nullable(),
  isHidden: z.boolean().default(false),
  isDisabled: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const menuItemBaseSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters").max(100),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().max(500).optional().nullable(),
  price: z.number().min(0, "Price must be non-negative"),
  discountPrice: z.number().min(0, "Discount price must be non-negative").nullable().optional(),
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .or(z.string().startsWith("data:image/"))
    .or(z.string().startsWith("/"))
    .optional()
    .nullable(),
  isVeg: z.boolean().default(true),
  isRecommended: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isChefSpecial: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  isHidden: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

export const menuItemSchema = menuItemBaseSchema.refine(
  (data) => {
    if (data.discountPrice !== undefined && data.discountPrice !== null) {
      return data.discountPrice <= data.price;
    }
    return true;
  },
  {
    message: "Discount price cannot exceed the original price",
    path: ["discountPrice"],
  }
);

export type MenuItemInput = z.infer<typeof menuItemSchema>;

