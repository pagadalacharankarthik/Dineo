# SMTP Configuration Guide for Dineo

To enable password resets, merchant onboarding welcomes, and general emails, you must configure SMTP settings inside your `.env.local` file. Below are the step-by-step instructions for the two best options: **Gmail (Free & Instant)** and **Resend (Professional/Custom Domain)**.

---

## Option 1: Using Gmail App Passwords (Free, Recommended for Testing/Launch)

If you have a Google Account, you can send emails directly using Google's SMTP servers. Note: Standard Gmail passwords will **not** work; you must generate a secure **App Password**.

### Step-by-Step Instructions:
1. Go to your [Google Account Console](https://myaccount.google.com/).
2. On the left navigation bar, click on **Security**.
3. Under *How you sign in to Google*, make sure **2-Step Verification** is turned **ON** (this is required to generate App Passwords).
4. Search for "App Passwords" in the top search bar or click on [Google App Passwords](https://myaccount.google.com/apppasswords).
5. Enter a name for the app (e.g. `Dineo SMTP`) and click **Create**.
6. A popup will appear showing a **16-character passcode** (e.g. `abcd efgh ijkl mnop`). Copy this code (without spaces).
7. Paste this code into your `.env.local` file:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="abcdefghijklmnop"
SMTP_SECURE="false"
SMTP_FROM='"Dineo Support" <your-email@gmail.com>'
```

---

## Option 2: Using Resend (Professional & Domain Branded)

If you have a custom domain (e.g. `dineo.in`) and want emails to send from `support@dineo.in` or `hello@dineo.in`, Resend is the best free developer choice (3,000 emails/month free).

### Step-by-Step Instructions:
1. Go to [Resend.com](https://resend.com) and create a free account.
2. In the Resend Dashboard, go to the **API Keys** page.
3. Click **Create API Key**, name it `Dineo API`, select the **Sending Access** permission, and click **Add**.
4. Copy the generated API key (it starts with `re_...`).
5. (Optional but recommended) Go to **Domains** on the left menu, click **Add Domain**, and add your DNS verification records (TXT, MX) to GoDaddy/Hostinger/Cloudflare so emails aren't marked as Spam.
6. Paste the credentials into your `.env.local` file:

```env
SMTP_HOST="smtp.resend.com"
SMTP_PORT="587"
SMTP_USER="resend"
SMTP_PASS="re_yourResendApiKeyHere"
SMTP_SECURE="false"
SMTP_FROM='"Dineo Support" <support@dineo.in>'
```

---

## Option 3: Using Brevo (Formerly Sendinblue - 300 free emails/day)

Brevo provides direct SMTP access.
1. Sign up on [Brevo.com](https://www.brevo.com/).
2. Click your brand name in the top right corner and click **SMTP & API**.
3. Click the **SMTP** tab to view your credentials.
4. Paste the credentials into your `.env.local` file:

```env
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="your-brevo-registered-email@example.com"
SMTP_PASS="your-smtp-master-key"
SMTP_SECURE="false"
SMTP_FROM='"Dineo Support" <support@dineo.in>'
```

---

### ⚠️ Important Notes
- **SMTP_SECURE:** Set this to `"false"` (lowercase string) because we connect using `TLS` (`Port 587` with STARTTLS upgrade), not legacy SSL (`Port 465`).
- **Restart Server:** Remember to restart your local server after modifying `.env.local` using `Ctrl + C` and running `npm run dev` again!
