import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/fotoknigi", "/oblozhki", "/ceny", "/holst", "/pereplet", "/restavraciya"];
  return routes.map((path, index) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: index < 2 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : index === 1 ? 0.95 : 0.8,
  }));
}
