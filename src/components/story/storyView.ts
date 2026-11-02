import type { StoryDetail } from "@/models/types/story";
import { provinceRecords } from "@/lib/thai-provinces";

/** Accept only http(s) URLs coming from user content. */
export function externalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export type GalleryLayout = "single" | "pair" | "mosaic";

/** Everything the story page needs, derived once from the API record. */
export function buildStoryView(story: StoryDetail) {
  const provinceName =
    provinceRecords.find((item) => item.slug === story.provinceSlug)?.name ?? story.provinceSlug;
  const sourceUrl = externalUrl(story.sourceUrl);
  const source = sourceUrl ? new URL(sourceUrl) : null;
  const cover = story.images.find((image) => externalUrl(image.url)) ?? null;
  const bodyImages = story.images.filter(
    (image) => externalUrl(image.url) && image.id !== cover?.id
  );
  const galleryLayout: GalleryLayout =
    bodyImages.length <= 1 ? "single" : bodyImages.length === 2 ? "pair" : "mosaic";

  return {
    provinceName,
    mapHref: `/?story=${encodeURIComponent(story.id)}`,
    source: source
      ? {
          url: source.toString(),
          host: source.hostname.replace(/^www\./, ""),
          path: `${source.pathname}${source.search}${source.hash}`,
        }
      : null,
    cover,
    bodyImages,
    galleryLayout,
    paragraphs: story.content.split(/\r?\n\s*\r?\n/).filter((paragraph) => paragraph.trim()),
  };
}

export type StoryView = ReturnType<typeof buildStoryView>;
