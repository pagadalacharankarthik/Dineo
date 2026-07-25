# Guide: Connecting DigitalPlat Free Domains to Vercel

This guide explains how to connect your free domain registered on **DigitalPlat** (e.g., `yourname.us.kg`, `yourname.dpdns.org`) to your Vercel hosting dashboard, making your **Dineo** deployment live.

---

## 🛠️ Step-by-Step Connection Guide

### Step 1: Add the Domain in Vercel
1. Log in to your **[Vercel Dashboard](https://vercel.com/)**.
2. Select your **Dineo** project.
3. Click on the **Settings** tab at the top.
4. From the left-hand menu, select **Domains**.
5. In the input box, type your full registered DigitalPlat domain (e.g., `dineo.us.kg` or `dineo.dpdns.org`) and click **Add**.
6. Select the recommended option (usually redirects to the `www` version or simple apex domain connection) and click **Add**.
7. Vercel will now show **Invalid Configuration** and display two DNS records (either **A Record** / **CNAME** or **NS Nameservers**). Keep this tab open.

---

### Step 2: Configure DNS inside DigitalPlat
1. Log in to your **[DigitalPlat Dashboard](https://digitalplat.org/)**.
2. Go to **My Domains** and select the domain you want to configure.
3. Go to the **DNS Management** or **Nameservers** settings:

#### Option A: Using CNAME / A Records (Recommended for speed)
Inside your DigitalPlat DNS records editor, add the details provided by Vercel:
* **Apex Domain** (e.g., `dineo.us.kg`):
  * **Type**: `A`
  * **Name / Host**: `@` or blank
  * **Value**: `76.76.21.21` (Vercel's global IP)
* **Subdomain** (e.g., `www.dineo.us.kg`):
  * **Type**: `CNAME`
  * **Name / Host**: `www`
  * **Value**: `cname.vercel-dns.com`

#### Option B: Pointing Nameservers to Cloudflare (Highly Recommended for Security)
Since free domains can face security filters, routing your domain through Cloudflare before pointing to Vercel is the industry best practice:
1. Create a free account on **[Cloudflare](https://cloudflare.com)**.
2. Click **Add a Site** and enter your DigitalPlat domain.
3. Cloudflare will give you two nameservers (e.g., `alice.ns.cloudflare.com` and `bob.ns.cloudflare.com`).
4. Copy these and paste them into the **Nameservers** section in your **DigitalPlat Dashboard**.
5. Once DNS propagates to Cloudflare, go to Cloudflare DNS settings and add the Vercel **A** and **CNAME** records there.

---

### Step 3: Verify and Go Live
1. Return to the **Vercel Domains** settings tab.
2. Click **Refresh** on the domain list.
3. Once DNS propagates (this can take anywhere from 2 minutes to 2 hours depending on DNS caches), Vercel will show a **green status indicator** (Active/Ready) and automatically issue a free **SSL Certificate** (HTTPS).
4. Your website is now live!

---

## ❓ Is DigitalPlat Free Forever?

### The Short Answer:
**Yes, the service itself is designed to be free forever** with no hidden fees, subscriptions, or upselling. It is backed by open-source community support and designed to assist developers and students.

### The Long Answer (Important Risks to Consider):
While DigitalPlat doesn't charge fees, using free public namespaces comes with trade-offs compared to buying a standard paid domain (like `.com` or `.in` from GoDaddy or Namecheap):

1. **No Absolute Ownership**: You do not legally own the parent domain registry (e.g., `.us.kg` or `.dpdns.org`). If the primary registry operator closes, changes their policies, or goes offline, your site will go offline instantly with no recourse.
2. **Spam & Reputation Filters**: Because these namespaces are free, bad actors often register them for temporary spam/phishing pages. This sometimes causes major security firewalls (like corporate networks, antivirus apps, or email spam filters) to block the parent domain extensions entirely.
3. **No Support Guarantees**: There is no paid service agreement. If the domain has configuration errors, you rely on community help threads.

### 💡 Recommendation for Dineo:
* **For Testing / Beta**: A free DigitalPlat domain is **perfect** to test your hosting, test QR scanning, and get initial merchant feedback.
* **For Commercial Launch**: Once you onboard active paying restaurants, **invest in a professional domain** (e.g., `.in` costs around $5/year, `.com` costs around $10/year). A custom professional domain builds trust with merchants and ensures your business infrastructure is 100% secure.
