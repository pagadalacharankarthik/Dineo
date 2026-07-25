import type { Metadata } from "next";
import PublicMenuClient from "./PublicMenuClient";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { name: true, description: true, logo: true, address: true, mobile: true },
  });

  const title = restaurant ? `${restaurant.name} — Digital Menu by Dineo Menu` : `${slug.toUpperCase()} — Digital Menu by Dineo Menu`;
  const description = `Digital Menu by Dineo Menu. Scan, view, and enjoy prices, categories, and items from ${restaurant?.name || slug}.`;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let imageUrl = `${baseUrl}/logo-light.png`; // Fallback to Dineo Menu logo if no logo is uploaded
  if (restaurant?.logo && restaurant.logo.trim() !== "") {
    imageUrl = restaurant.logo.startsWith("http") ? restaurant.logo : `${baseUrl}${restaurant.logo}`;
  }

  const images = [{ url: imageUrl }];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: "website",
      url: `${baseUrl}/menu/${slug}`,
      siteName: "Dineo Menu",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;

  // Fetch restaurant info for JSON-LD structured data (Google rich results)
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { name: true, description: true, logo: true, address: true, mobile: true, email: true },
  }).catch(() => null);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const jsonLd = restaurant ? {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurant.name,
    "description": restaurant.description || `Digital menu for ${restaurant.name}`,
    "url": `${baseUrl}/menu/${slug}`,
    "image": restaurant.logo
      ? (restaurant.logo.startsWith("http") ? restaurant.logo : `${baseUrl}${restaurant.logo}`)
      : undefined,
    "address": restaurant.address ? {
      "@type": "PostalAddress",
      "streetAddress": restaurant.address,
    } : undefined,
    "telephone": restaurant.mobile || undefined,
    "email": restaurant.email || undefined,
    "servesCuisine": "Restaurant",
    "hasMenu": `${baseUrl}/menu/${slug}`,
    "potentialAction": {
      "@type": "ViewAction",
      "target": `${baseUrl}/menu/${slug}`,
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PublicMenuClient slug={slug} />
    </>
  );
}

