import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/upload",
        "/jobs",
        "/products",
        "/review",
        "/analytics",
        "/audit",
        "/settings",
        "/profile",
      ],
    },
    sitemap: "https://catalogforge.tech/sitemap.xml",
  };
}
