# 🚀 Dineo — Deployment Guide (Vercel + Neon)

> **No separate backend server needed!**
> Vercel hosts everything — your frontend pages AND all your API routes run as serverless functions on Vercel automatically. No Render, no Railway, no Express server.

---

## STEP 1 — Push Code to GitHub

Your code is already on GitHub at: https://github.com/pagadalacharankarthik/Dineo

If you make new changes, just run these in **VS Code Terminal** (`Ctrl + `` ` ``):
```bash
git add .
git commit -m "your message here"
git push origin main
```

---

## STEP 2 — Set Up Neon PostgreSQL (Production Database)

> Create a **separate** production database — don't use the same one as development.

1. Go to [https://neon.tech](https://neon.tech) → Log in
2. Click **New Project** → Name it `dineo-production`
3. Choose region: **AWS ap-south-1 (Mumbai)** — closest for India
4. Once created, go to **Connection Details** panel
5. Copy the two connection strings:

```
Pooled connection   → DATABASE_URL
Direct connection   → DIRECT_URL
```

> Make sure the pooled URL ends with `?sslmode=require&pgbouncer=true&connect_timeout=15`

---

## STEP 3 — Deploy to Vercel

### 3a. Create Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with **GitHub** account

### 3b. Import Project
1. Click **Add New → Project**
2. Find `Dineo` repository → Click **Import**
3. Vercel auto-detects it as Next.js ✅

### 3c. Add Environment Variables
Scroll to **Environment Variables** section. Add each one:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon **pooled** connection string |
| `DIRECT_URL` | Your Neon **direct** connection string |
| `BETTER_AUTH_SECRET` | Random 32-char string (see below to generate) |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` (update after first deploy) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (update after first deploy) |
| `NEXT_PUBLIC_APP_NAME` | `Dineo` |
| `ADMIN_JWT_SECRET` | Random 64-char hex string (see below to generate) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | Your Gmail App Password |
| `SMTP_FROM` | `Dineo <your@gmail.com>` |
| `RAZORPAY_KEY_ID` | Your Razorpay live key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | Your Razorpay webhook secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as RAZORPAY_KEY_ID |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID |

**To generate secrets**, open VS Code Terminal and run:
```bash
# For BETTER_AUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# For ADMIN_JWT_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3d. Deploy
- Click **Deploy** → Wait ~3 minutes
- You get a URL like `https://dineo-abc123.vercel.app`

### 3e. Update the URL variables
1. Vercel → your project → **Settings → Environment Variables**
2. Edit `BETTER_AUTH_URL` → paste your real Vercel URL
3. Edit `NEXT_PUBLIC_APP_URL` → paste your real Vercel URL
4. Go to **Deployments** → Click **⋯ → Redeploy** on the latest deployment

---

## STEP 4 — Run Database Migration

> **Where to run this:** In your **local VS Code Terminal** (on your laptop/PC).
> It connects to your Neon production database via `DIRECT_URL`.

### 4a. Update your local .env.local temporarily

Open `.env.local` on your computer and set the production DB URLs:
```
DATABASE_URL="your-neon-production-pooled-url"
DIRECT_URL="your-neon-production-direct-url"
```

### 4b. Run the migration in VS Code Terminal
```bash
npx prisma db push
```

This creates all the database tables in your Neon production database.

You should see:
```
✅ Your database is now in sync with your Prisma schema.
```

> After this, you can restore your local dev DB URLs in `.env.local` if you want.

---

## STEP 5 — Create Admin Account

> **Where to do this:** Directly in **Neon's SQL Editor** — no code needed.

### 5a. Open Neon SQL Editor
1. Go to [https://neon.tech](https://neon.tech)
2. Open your `dineo-production` project
3. Click **SQL Editor** in the left sidebar

### 5b. Generate a password hash
Open **VS Code Terminal** on your laptop and run:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourStrongPassword123!', 12).then(h => console.log(h))"
```

Copy the output — it looks like: `$2a$12$abc123...`

> Replace `YourStrongPassword123!` with your real admin password.

### 5c. Insert admin account via SQL

In the Neon SQL Editor, paste and run this query:

```sql
INSERT INTO admin_users (id, name, email, "passwordHash", role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Charan',
  'your@email.com',
  '$2a$12$PASTE_YOUR_BCRYPT_HASH_HERE',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

> Replace `your@email.com` and the bcrypt hash with your actual values.

Click **Run** → You should see `INSERT 1` confirming the admin was created.

### 5d. Login
Visit `https://your-app.vercel.app/admin/login` and use your email + password.

---

## STEP 6 — Update URLs After Custom Domain (Optional)

If you connect a custom domain (e.g., `dineoapp.in`):
1. Vercel → Settings → Domains → Add your domain
2. Add DNS records at your domain registrar:
   - `A record: @ → 76.76.21.21`
   - `CNAME: www → cname.vercel-dns.com`
3. Update Vercel env variables:
   - `BETTER_AUTH_URL` → `https://dineoapp.in`
   - `NEXT_PUBLIC_APP_URL` → `https://dineoapp.in`
4. Redeploy

---

## STEP 7 — Razorpay Webhook (For Live Payments)

1. Razorpay Dashboard → Settings → Webhooks → **Add New Webhook**
2. URL: `https://your-domain.com/api/webhooks/razorpay`
3. Select events: `subscription.charged`, `subscription.halted`, `subscription.cancelled`
4. Copy webhook secret → Add to Vercel as `RAZORPAY_WEBHOOK_SECRET`
5. Redeploy

---

## 🔁 Future Updates

Every time you push to GitHub, Vercel auto-deploys:
```bash
git add .
git commit -m "your update"
git push origin main
```
Vercel detects the push and deploys in ~2 minutes. Zero manual steps.

---

## ✅ Post-Deployment Test Checklist

- [ ] Homepage loads
- [ ] Register new restaurant account
- [ ] Login and access dashboard
- [ ] Add category + menu item
- [ ] Visit `/menu/your-slug` as a customer (public menu)
- [ ] Submit contact form → check Telegram alert
- [ ] Download QR code
- [ ] Visit `/admin/login` with admin credentials
- [ ] Test 404: visit `/some-random-invalid-url`

---

## 💡 Quick Reference

| Question | Answer |
|----------|--------|
| Do I need Render/Railway/backend server? | ❌ No — Vercel handles everything including API routes |
| Where do I run `prisma db push`? | ✅ Your local PC terminal (VS Code terminal) |
| Where do I create admin account? | ✅ Neon SQL Editor → paste INSERT query |
| Where do I add env variables? | ✅ Vercel → Project → Settings → Environment Variables |
| How do I update after code changes? | ✅ `git push origin main` → Vercel auto-deploys |
| Do I need to restart the server? | ❌ No — Vercel is serverless, always on |
