import type { MetadataRoute } from "next";
import { listSitemapStories, provinceLastModified } from "@/api/stories/public";
import { STORIES_PER_SITEMAP, staticEntries, storyEntries } from "@/lib/seo/sitemap";

export const revalidate = 3600;

/**
 * /sitemap.xml: static pages, the 5 categories, provinces with at least one
 * published story, and every APPROVED story.
 *
 * One file holds up to 45,000 stories. Past that, export generateSitemaps()
 * returning { id } per STORIES_PER_SITEMAP block and pass `id * STORIES_PER_SITEMAP`
 * as the offset below; then point robots.ts at each /sitemap/<id>.xml.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [provinces, stories] = await Promise.all([
    provinceLastModified(),
    listSitemapStories(0, STORIES_PER_SITEMAP),
  ]);
  return [...staticEntries(provinces), ...storyEntries(stories)];
}
