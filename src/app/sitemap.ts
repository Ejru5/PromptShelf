import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/config/categories";
import { SITE } from "@/config/site";
import { getAllPrompts, getCollections } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [prompts, collections] = await Promise.all([getAllPrompts(), getCollections()]);
  const url = (path: string) => new URL(path, SITE.url).toString();
  const newest = prompts.reduce((d, p) => (p.updated > d ? p.updated : d), "2026-01-01");
  return [
    { url: url("/"), lastModified: newest, changeFrequency: "weekly", priority: 1 },
    { url: url("/shelves"), lastModified: newest, changeFrequency: "weekly", priority: 0.8 },
    ...CATEGORIES.map((c) => {
      const shelf = prompts.filter((p) => p.category === c.slug);
      return {
        url: url(`/shelves/${c.slug}`),
        lastModified: shelf.reduce((d, p) => (p.updated > d ? p.updated : d), "2026-01-01"),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    }),
    ...prompts.map((p) => ({
      url: url(`/p/${p.slug}`),
      lastModified: p.updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: url("/collections"), lastModified: newest, changeFrequency: "monthly", priority: 0.6 },
    ...collections.map((c) => ({
      url: url(`/collections/${c.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: url("/search"), changeFrequency: "monthly", priority: 0.3 },
  ];
}
