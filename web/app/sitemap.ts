import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/fotoknigi", "/holst", "/pereplet", "/restavraciya", "/suveniry", "/podarochnye-nabory", "/oblozhki", "/ceny", "/kontakty"];
  return routes.map((path, index) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: index < 7 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : index < 7 ? 0.9 : 0.75,
  }));
}
