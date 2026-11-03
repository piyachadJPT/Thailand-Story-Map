import { countPublishedStories } from "@/api/stories/public";
import { findCategory, storyCategories } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { brandImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og";

export const alt = `หมวดเรื่องเล่าบน ${siteConfig.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return storyCategories.map((category) => ({ slug: category.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = findCategory(slug) ?? storyCategories[0];
  const count = await countPublishedStories({ categorySlug: category.slug }).catch(() => undefined);
  return brandImage({
    eyebrow: "หมวดเรื่องเล่า",
    title: category.seoTitle,
    subtitle: category.hint,
    count,
    accent: category.hex,
  });
}
