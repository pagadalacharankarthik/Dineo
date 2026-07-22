# Batch 2 – QR Code Generation, Menu Categories & Menu Management (MVP) Documentation

## Overview
Batch 2 completes the **Core QR Menu Management System (MVP)** for **Dineo**. Restaurant administrators can manage menu categories, create & edit dishes, toggle real-time stock availability, and access a permanent high-resolution QR code that opens their public digital menu.

---

## 1. Database Schema Extensions (`prisma/schema.prisma`)
The PostgreSQL database (Neon) has been extended with the following models:
- **`Category`**: Stores menu categories (`name`, `description`, `isHidden`, `isDisabled`, `displayOrder`, `restaurantId`).
- **`MenuItem`**: Stores dishes & drinks (`name`, `categoryId`, `description`, `price`, `imageUrl`, `isVeg`, `isRecommended`, `isBestSeller`, `isChefSpecial`, `isAvailable`, `isHidden`, `displayOrder`).
- **`QRCode`**: Tracks permanent QR codes (`code`, `targetUrl`, `qrType`, `scansCount`).

---

## 2. Permanent QR Code System
- Every restaurant receives **one permanent unique QR code** mapped to `/menu/{restaurant-slug}`.
- QR codes never change even when prices or menu items update.
- Admin can download QR as:
  - **High-Res PNG** (1024x1024)
  - **Vector SVG**
  - **Print-Ready Poster** (built-in `@media print` layout for standees/stickers)
- Live scan tracking counter (`scansCount`) automatically increments whenever a customer scans the QR code.

---

## 3. Public Customer Menu (`/menu/[slug]`)
- Accessible publicly without authentication.
- Responsive, mobile-first design optimized for Android & iOS phone screens.
- Includes:
  - Restaurant Header (Logo, Name, Description, Phone, Address, Timings)
  - Instant Search Bar (Search dishes by name or ingredients)
  - Category Filter pills bar
  - Dish Cards with Veg/Non-Veg icons, prices, descriptions, special badges (⭐ Recommended, 🔥 Bestseller, 👨‍🍳 Chef Special)
  - Real-time **"Out of Stock"** banners for unavailable items.

---

## 4. API Endpoints Reference

| Endpoint | Method | Purpose | Security |
|----------|--------|---------|----------|
| `/api/restaurant` | `GET` / `PUT` | Manage restaurant profile & slug | Authenticated Admin |
| `/api/dashboard/stats` | `GET` | Retrieve real-time dashboard metrics | Authenticated Admin |
| `/api/qr` | `GET` | Get QR metadata & permanent URL | Authenticated Admin |
| `/api/categories` | `GET` / `POST` | List & Create menu categories | Authenticated Admin |
| `/api/categories/[id]` | `PUT` / `DELETE` | Edit & Delete category | Authenticated Admin |
| `/api/categories/reorder` | `POST` | Reorder category sequence | Authenticated Admin |
| `/api/menu-items` | `GET` / `POST` | List & Create menu items | Authenticated Admin |
| `/api/menu-items/[id]` | `PUT` / `DELETE` | Edit & Delete menu item | Authenticated Admin |
| `/api/menu-items/[id]/toggle-availability` | `PATCH` | Instant Out of Stock toggle | Authenticated Admin |
| `/api/menu-items/[id]/duplicate` | `POST` | Clone an existing menu item | Authenticated Admin |
| `/api/menu-items/reorder` | `POST` | Reorder menu item sequence | Authenticated Admin |
| `/api/public/menu/[slug]` | `GET` | Fetch public customer menu & track scans | Public |
| `/api/upload` | `POST` | Upload dish & logo images | Authenticated Admin |

---

## 5. Security & Isolation
- All admin endpoints verify the user's session using Better Auth and restrict mutations to `restaurantId == user.restaurant.id`.
- Public menu endpoint (`/api/public/menu/[slug]`) is read-only and strips sensitive owner metadata.

---

## 6. Future Batch Placeholders (Prepared Architecture)
The codebase & schema have been architected to seamlessly plug in future modules in Batch 3+:
- **Table-specific QR Codes**: `QRType.TABLE_SPECIFIC` enum already in Prisma schema.
- **Customer Ordering & Cart**: Public menu item structure prepared for add-to-cart handlers.
- **Analytics & Scans**: `scansCount` and scan logs ready for visual charts in Batch 3.
