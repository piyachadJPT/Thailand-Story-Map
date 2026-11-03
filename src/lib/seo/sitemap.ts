import type { MetadataRoute } from "next";
import { storyCategories } from "@/config/categories";
import { categoryPath, provincePath, storyPath, absoluteUrl } from "./url";

/** Google's limit is 50,000 URLs per file; stay well below it. */
export const STORIES_PER_SITEMAP = 45_000;

export const STATIC_PATHS = [
  "/",
  "/categories",
  "/province",
  "/places",
  "/contribute",
  "/about",
  "/privacy",
  "/terms",
] as const;

export type SitemapStory = {
  slug: string;
  updatedAt: Date;
  province: { slug: string };
  images: { url: string }[];
};

/** Pages that are not stories: static pages, 5 categories, provinces that have stories. */
export function staticEntries(
  provinces: { slug: string; updatedAt: Date | null }[]
): MetadataRoute.Sitemap {
  return [
    ...STATIC_PATHS.map((path) => ({ url: absoluteUrl(path) })),
    ...storyCategories.map((category) => ({ url: absoluteUrl(categoryPath(category.slug)) })),
    ...provinces.map((province) => ({
      url: absoluteUrl(provincePath(province.slug)),
      ...(province.updatedAt ? { lastModified: province.updatedAt } : {}),
    })),
  ];
}

/** Published stories; Thai slugs are percent-encoded by storyPath. */
export function storyEntries(stories: SitemapStory[]): MetadataRoute.Sitemap {
  return stories.map((story) => ({
    url: absoluteUrl(storyPath(story.province.slug, story.slug)),
    lastModified: story.updatedAt,
    ...(story.images[0] ? { images: [story.images[0].url] } : {}),
  }));
}
