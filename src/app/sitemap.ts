import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Dynamic menu urls
  let restaurantUrls: { url: string; lastModified: Date; changeFrequency: "daily"; priority: number }[] = [];
  try {
    const restaurants = await db.restaurant.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    restaurantUrls = restaurants.map((r) => ({
      url: `${baseUrl}/menu/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error generating dynamic sitemap urls:", error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...restaurantUrls,
  ];
}
