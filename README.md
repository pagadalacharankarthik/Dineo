# Restaurant QR Menu Management System (MVP - Phase 1)

Welcome to the **Restaurant QR Menu Management System** (Phase 1 Foundation). This repository serves as the scalable foundation for a SaaS-ready digital QR menu platform for restaurants.

---

## 📂 Project Structure

```
qr/
├── prisma/
│   ├── schema.prisma             # PostgreSQL schemas (Users, Restaurants, Sessions, Resets, Verifications)
│   └── prisma.config.ts          # Prisma 7 JS/TS-based configuration
├── src/
│   ├── app/
│   │   ├── (landing)/            # Public pages: Home, Features, Pricing, About, Contact, Privacy, Terms
│   │   ├── (auth)/               # Auth pages: Login, Register, Forgot Password, Reset Password
│   │   ├── (dashboard)/          # Protected routes: Dashboard, Restaurant Profile, User Settings
│   │   ├── api/
│   │   │   ├── auth/[...all]/    # Better Auth route handlers
│   │   │   ├── dashboard/        # Dashboard stats endpoints
│   │   │   ├── restaurant/       # Restaurant CRUD endpoints
│   │   │   └── user/             # User Profile settings endpoints
│   │   ├── layout.tsx            # Global HTML wrapper (with ThemeProvider and Toaster)
│   │   └── globals.css           # Tailwind v4 globals and custom themes
│   ├── components/
│   │   ├── dashboard/            # Topbar, Sidebar, DashboardCard
│   │   └── shared/               # ThemeProvider, LoadingSpinner, EmptyState, ErrorState, Navbar, Footer
│   ├── lib/
│   │   ├── auth.ts               # Better Auth Server initialization
│   │   ├── auth-client.ts        # Better Auth Client SDK imports
│   │   ├── db.ts                 # Prisma Client with Neon serverless adapter
│   │   ├── utils.ts              # Helper functions (slugify, formatTime, API helpers)
│   │   └── validations/          # Zod schemas for all forms and request payloads
│   └── middleware.ts             # Route protection middleware
├── postcss.config.mjs            # PostCSS configuration for Tailwind v4
├── next.config.ts                # Next.js configurations
├── tsconfig.json                 # TypeScript compiler configuration
└── package.json                  # Dependencies list
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Pooled connection — used by the app at runtime
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"

# Direct connection — used by prisma db push / prisma migrate
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/neondb?sslmode=require"

# Better Auth Secret (generate using: openssl rand -base64 32)
BETTER_AUTH_SECRET="your-32+-character-random-string"
BETTER_AUTH_URL="http://localhost:3000"

# Application domain settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="QRMenu"
```

---

## 🚀 Setup & Installation Instructions

Follow these steps to get your development environment running:

### 1. Clone the project and install dependencies
```bash
npm install
```

### 2. Set up Neon PostgreSQL (free tier)
1. Go to [https://neon.tech](https://neon.tech) and create a free account.
2. Create a new project — choose the region closest to you.
3. Open your project → **Connection Details**:
   - Copy the **Pooled connection** string → paste as `DATABASE_URL` in `.env.local`
   - Copy the **Direct connection** string → paste as `DIRECT_URL` in `.env.local`
4. Push the database schema:
   ```bash
   npx prisma db push
   ```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Development & Command Guide

| Action | Command |
|---|---|
| Run Dev Server | `npm run dev` |
| Build Production Bundle | `npm run build` |
| Check Typings & Lints | `npx tsc --noEmit` |
| View DB Dashboard (Studio) | `npx prisma studio` |
| Sync DB Schema | `npx prisma db push` |
| Generate Prisma Client | `npx prisma generate` |

---

## 🔒 Security Architectures Implemented
- **Password Hashing:** Automated secure password encryption via Better Auth.
- **CSRF Protection:** Native cookie protection configuration.
- **Route Guard Middleware:** Strict redirects for authenticated/unauthenticated routes.
- **Input Validations:** All forms and APIs validated strictly using Zod.
- **TypeScript Strict Mode:** High-level compile-time safety.

---

## 💳 Subscription Tiers & Feature Matrix

The platform supports plan-specific features and visual themes:

### 1. Starter Plan — ₹0/month
- **Limits:** 1 QR Code, Up to 50 menu items.
- **Theme:** Default light/dark system responsive layout.
- **Support:** Email support.

### 2. Professional Plan — ₹999/month
- **Limits:** Unlimited QR Codes & menu items.
- **Theme:** Premium royal slate-indigo theme designs.
- **Features:** Coupon promo codes, Google reviews link, priority support, advanced analytics.

### 3. Enterprise Plan — ₹2,999/month
- **Limits:** Unlimited QR Codes & menu items, multi-location support.
- **Theme:** Luxury gold/bronze layout designs.
- **Features:** Staff management accounts, custom domain integrations, dedicated account support.
