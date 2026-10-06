import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://banglabazar.com.bd";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/products/*",
          "/brands",
          "/campaigns",
          "/deals",
          "/flash-sales",
          "/weekly-best-product",
          "/trending",
          "/offers",
          "/about",
          "/help",
          "/privacy-policy",
        ],
        disallow: [
          "/api/*",
          "/dashboard/*",
          "/admin/*",
          "/cart",
          "/checkout",
          "/congratulation",
          "/track-order",
          "/auth/*",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/uploads/*", "/img/*", "/_next/image*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
