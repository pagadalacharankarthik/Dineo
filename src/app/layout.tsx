import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { CookieConsent } from "@/components/shared/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Dineo Menu — Smart QR Menu for Restaurants",
    template: "%s | Dineo Menu",
  },
  description:
    "Replace printed menus with smart QR menus. Create, manage, and update your restaurant menu instantly without reprinting menu cards.",
  keywords: [
    "QR menu",
    "restaurant menu",
    "digital menu",
    "QR code menu",
    "restaurant management",
  ],
  authors: [{ name: "Dineo Menu" }],
  creator: "Dineo Menu",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Dineo Menu — Smart QR Menu for Restaurants",
    description:
      "Replace printed menus with smart QR menus. Create, manage, and update your restaurant menu instantly.",
    siteName: "Dineo Menu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dineo Menu — Smart QR Menu for Restaurants",
    description:
      "Replace printed menus with smart QR menus. Create, manage, and update your restaurant menu instantly.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  verification: {
    google: "hs0Ddy1hL-2WiqKOaOIOmbzSbCbXpDhfjoFBKTqdoeQ",
  },
};

import { PWARegister } from "@/components/shared/PWARegister";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
          <CookieConsent />
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
