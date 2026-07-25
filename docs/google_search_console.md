# Guide: Adding Dineo Menu to Google Search Console

This guide provides step-by-step instructions on how to add your website to **Google Search Console** to ensure it is indexed and ranks at the top of Google search results for **"Dineo Menu"**.

---

## 🛠️ Step 1: Open Google Search Console
1. Go to the **[Google Search Console Dashboard](https://search.google.com/search-console)**.
2. Log in with your business or developer Google Account.
3. Click the **"Add Property"** button from the top-left dropdown.

---

## 🛠️ Step 2: Choose a Verification Method
You will see two options: **Domain** and **URL prefix**. Choose one of the methods below:

### Method A: DNS TXT Record (Highly Recommended - Domain Method)
*This verifies your entire domain name, including all future landing pages and subdomains (like `www.yourdomain.com`).*

1. In the **Domain** box, type your apex domain (e.g., `dineomenu.in` or your free `yourname.us.kg` domain) and click **Continue**.
2. Google will generate a **TXT Verification Record** (a string of letters and numbers starting with `google-site-verification=...`). Copy this record.
3. Go to your domain registrar (GoDaddy, Namecheap, Hostinger) or **Cloudflare Dashboard** where your DNS records are managed.
4. Add a new DNS Record:
   * **Type**: `TXT`
   * **Name / Host**: `@` or blank
   * **Value / Content**: Paste the `google-site-verification=...` string.
   * **TTL**: Auto or 3600.
5. Save the record.
6. Return to Google Search Console and click **Verify**.

---

### Method B: Meta Verification Tag (Easy Method - URL Prefix)
*This uses a `<meta>` tag injected into your website code. We have already programmed this feature into Dineo Menu so you can configure it from Vercel!*

1. In the **URL Prefix** box, type your full production homepage URL (e.g., `https://www.dineomenu.in` or `https://yourproject.vercel.app`) and click **Continue**.
2. Under *Other verification methods*, select **HTML Tag**.
3. Google will show a code line: `<meta name="google-site-verification" content="COPIED_CODE_HERE" />`.
4. Copy **only the content code** inside the quotation marks (e.g. the `COPIED_CODE_HERE` part).
5. Open your **Vercel Project Dashboard** ➜ **Settings** ➜ **Environment Variables**.
6. Add a new environment variable:
   * **Key**: `NEXT_PUBLIC_GOOGLE_VERIFICATION_ID`
   * **Value**: Paste the code you copied from Google.
7. Click **Save**.
8. Redeploy the project on Vercel (or push a commit) so that the environment variable becomes active.
9. Return to Google Search Console and click **Verify**.

---

## 🚀 Step 3: Submit your Sitemap (Crucial for Rapid Indexing)
Once verified, you must tell Google about your dynamic site structure so it lists your restaurant client menus.

1. In the Google Search Console sidebar, click on **Sitemaps** (under the Indexing category).
2. Under *Add a new sitemap*, enter your sitemap path:
   ```text
   sitemap.xml
   ```
3. Click **Submit**.
4. Google will queue your site for scanning. The status will update to **"Success"** within a few hours, and your site pages will start appearing in Google search results within **24 to 48 hours**!
