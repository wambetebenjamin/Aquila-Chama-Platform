import { readdirSync } from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Slugs are read straight off the filesystem rather than through `@/lib/blog`,
 * so this route handler never has to evaluate the MDX modules (and their React
 * runtime) during build-time data collection.
 */
function blogSlugs(): string[] {
  const dir = path.join(process.cwd(), "src/content/blog");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

/**
 * Dynamic sitemap from marketing page slugs only.
 * /app (authenticated dashboard) and /api are deliberately excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/demo`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/blog`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${site.url}/legal/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/legal/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/legal/cookie-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const articles: MetadataRoute.Sitemap = blogSlugs().map((slug) => ({
    url: `${site.url}/blog/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...articles];
}
