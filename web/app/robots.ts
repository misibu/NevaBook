import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/create", "/account", "/checkout", "/admin", "/project/"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
