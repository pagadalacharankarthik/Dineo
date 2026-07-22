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
    select: { name: true, description: true, logo: true },
  });

  const title = restaurant ? `${restaurant.name} — Digital Menu | Dineo` : `${slug.toUpperCase()} — Digital Menu | Dineo`;
  const description = restaurant?.description || `Scan and view the official digital menu for ${restaurant?.name || slug} powered by Dineo. Replace printed menu cards with smart QR menus.`;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let imageUrl = "";
  if (restaurant?.logo) {
    imageUrl = restaurant.logo.startsWith("http") ? restaurant.logo : `${baseUrl}${restaurant.logo}`;
  }

  const images = imageUrl ? [{ url: imageUrl }] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: "website",
      url: `${baseUrl}/menu/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;
  return <PublicMenuClient slug={slug} />;
}
