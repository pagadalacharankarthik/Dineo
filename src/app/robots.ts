import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dineo-eta.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/menu/"],
      disallow: ["/dashboard/", "/settings/", "/categories/", "/qr-code/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
