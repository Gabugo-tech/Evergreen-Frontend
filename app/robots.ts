import type { MetadataRoute } from "next";

const BASE_URL = "https://evergreen-frontend-lac.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/home", "/login", "/register", "/forgot-password"],
        // Block all authenticated/private routes from crawlers
        disallow: [
          "/dashboard",
          "/banking",
          "/payments",
          "/transactions",
          "/portfolio",
          "/notifications",
          "/settings",
          "/admin",
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
