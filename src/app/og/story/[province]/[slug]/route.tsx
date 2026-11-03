import { lookupStory } from "@/api/stories/public";
import { findCategory } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { brandImage, storyImage } from "@/lib/seo/og";
import { decodeParam } from "@/lib/seo/url";

/**
 * Open Graph image of a story at a fixed URL (/og/story/<province>/<slug>), so
 * the page metadata and the Article JSON-LD can both point at it. An
 * opengraph-image file would get a build hash in its URL.
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

export async function GET(_request: Request, { params }: { params: Promise<{ province: string; slug: string }> }) {
  const { province, slug } = await params;
  const result = await lookupStory(decodeParam(province), decodeParam(slug)).catch(() => null);
  if (result?.kind !== "story") {
    return brandImage({ title: siteConfig.nameTh, subtitle: siteConfig.tagline });
  }
  const story = result.story;
  return storyImage({
    title: story.title,
    categoryName: story.category.name,
    categoryColor: findCategory(story.category.slug)?.hex ?? "#c8963e",
    provinceName: story.province.name,
    coverUrl: story.images[0]?.url,
  });
}
