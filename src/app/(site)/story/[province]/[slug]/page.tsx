import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Compass, MapPin } from "lucide-react";
import { listRelatedStories, listStoryPaths, lookupStory, type PublishedStory } from "@/api/stories/public";
import JsonLd from "@/components/seo/JsonLd";
import StoryBody from "@/components/story/StoryBody";
import StoryCover from "@/components/story/StoryCover";
import StoryFooter from "@/components/story/StoryFooter";
import StoryHeader from "@/components/story/StoryHeader";
import StoryMapBackground from "@/components/story/StoryMapBackground";
import StoryReader from "@/components/story/StoryReader";
import StorySection from "@/components/story/StorySection";
import StoryViewBeacon from "@/components/story/StoryViewBeacon";
import { buildStoryView } from "@/components/story/storyView";
import { Notice } from "@/components/ui/notice";
import { articleJsonLd, breadcrumbJsonLd, graph, type Crumb } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { coverAltText, storySeoTitle } from "@/lib/seo/story";
import { decodeParam, provincePath, storyOgImagePath, storyPath } from "@/lib/seo/url";
import type { StoryDetail } from "@/models/types/story";

/*
 * Every published story is prebuilt at build time, so opening a story (a link,
 * a pasted URL, a search result) is served straight from cache. Stories
 * published later are built on their first visit. Pages refresh hourly or
 * right after an edit/moderation.
 */
export const revalidate = 3600;
export async function generateStaticParams() {
  try {
    const stories = await listStoryPaths();
    return stories.map((story) => ({ province: story.province.slug, slug: story.slug }));
  } catch {
    // Database unreachable at build time: fall back to building on first visit.
    return [];
  }
}

type Props = { params: Promise<{ province: string; slug: string }> };

/** The published story, or a 308 to its canonical URL, or a 404. */
const readStory = cache(async (rawProvince: string, rawSlug: string) => {
  const result = await lookupStory(decodeParam(rawProvince), decodeParam(rawSlug));
  if (result.kind === "redirect") {
    permanentRedirect(storyPath(result.path.provinceSlug, result.path.slug));
  }
  if (result.kind === "missing") notFound();
  return result.story;
});

function toDetail(story: PublishedStory): StoryDetail {
  return {
    id: story.id,
    title: story.title,
    slug: story.slug,
    summary: story.summary,
    latitude: story.latitude,
    longitude: story.longitude,
    viewCount: story.viewCount,
    categorySlug: story.category.slug,
    categoryColor: story.category.color,
    provinceSlug: story.province.slug,
    status: story.status,
    createdAt: story.createdAt.toISOString(),
    content: story.content,
    sourceUrl: story.sourceUrl,
    isSensitive: story.isSensitive,
    rejectReason: story.rejectReason,
    images: story.images.map((image) => ({
      id: image.id,
      url: image.url,
      altText: image.altText,
      sortOrder: image.sortOrder,
    })),
    tags: story.tags.map((item) => ({ id: item.tag.id, name: item.tag.name, slug: item.tag.slug })),
    author: { id: story.author.id, name: story.author.name, image: story.author.image },
  };
}

function crumbsFor(story: PublishedStory): Crumb[] {
  return [
    { name: "หน้าแรก", path: "/" },
    { name: story.province.name, path: provincePath(story.province.slug) },
    { name: story.title, path: storyPath(story.province.slug, story.slug) },
  ];
}

const publishedAtOf = (story: PublishedStory) => (story.publishedAt ?? story.createdAt).toISOString();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province, slug } = await params;
  const story = await readStory(province, slug);
  return buildMetadata({
    title: storySeoTitle(story),
    description: story.summary,
    path: storyPath(story.province.slug, story.slug),
    type: "article",
    publishedTime: publishedAtOf(story),
    modifiedTime: story.updatedAt.toISOString(),
    section: story.category.name,
    authors: story.author.name ? [story.author.name] : undefined,
    image: {
      url: storyOgImagePath(story.province.slug, story.slug),
      width: 1200,
      height: 630,
      alt: `${story.title} — ${story.category.name} ${story.province.name}`,
    },
  });
}

export default async function StoryDetailPage({ params }: Props) {
  const { province, slug } = await params;
  const story = await readStory(province, slug);
  const detail = toDetail(story);
  const view = buildStoryView(detail);
  const path = storyPath(story.province.slug, story.slug);
  const crumbs = crumbsFor(story);
  const related = await listRelatedStories(story);

  const jsonLd = graph(
    articleJsonLd({
      title: story.title,
      summary: story.summary,
      path,
      images: [...(view.cover ? [view.cover.url] : []), storyOgImagePath(story.province.slug, story.slug)],
      publishedAt: publishedAtOf(story),
      updatedAt: story.updatedAt.toISOString(),
      authorName: story.author.name,
      categoryName: story.category.name,
      place: {
        provinceName: story.province.name,
        latitude: story.latitude,
        longitude: story.longitude,
      },
    }),
    breadcrumbJsonLd(crumbs)
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <StoryViewBeacon storyId={story.id} />
      <StoryMapBackground />
      <article className="relative z-10 w-full space-y-10 px-6 pt-4 pb-16 sm:space-y-14 sm:px-10 sm:pt-8 lg:px-20 xl:px-32">
        <StoryHeader
          title={story.title}
          summary={story.summary}
          categorySlug={story.category.slug}
          provinceName={story.province.name}
          mapHref={view.mapHref}
          author={story.author}
          publishedAt={publishedAtOf(story)}
          updatedAt={story.updatedAt.toISOString()}
          viewCount={story.viewCount}
          breadcrumbs={crumbs}
        />
        {view.cover ? (
          <div className="mx-auto w-full max-w-5xl">
            <StoryCover
              url={view.cover.url}
              alt={coverAltText(view.cover.altText, story.title, story.province.name)}
            />
          </div>
        ) : null}
        {story.isSensitive ? (
          <Notice className="mx-auto max-w-170">
            เรื่องนี้มีเนื้อหาเกี่ยวกับเหตุการณ์อ่อนไหว โปรดใช้วิจารณญาณในการอ่าน
          </Notice>
        ) : null}
        <StoryReader>
          <StoryBody
            title={story.title}
            paragraphs={view.paragraphs}
            images={view.bodyImages}
            layout={view.galleryLayout}
            provinceName={story.province.name}
          />
        </StoryReader>
        <StoryFooter
          storyId={story.id}
          title={story.title}
          tags={detail.tags}
          source={view.source}
          latitude={story.latitude}
          longitude={story.longitude}
          provinceName={story.province.name}
          categorySlug={story.category.slug}
          mapHref={view.mapHref}
        />
      </article>
      {related.sameProvince.length || related.sameCategory.length ? (
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 pb-16 sm:px-6">
          {related.sameProvince.length ? (
            <StorySection
              index={1}
              icon={MapPin}
              title={`เรื่องอื่นใน${story.province.name}`}
              description={`เรื่องเล่าจากพิกัดอื่นใน${story.province.name}`}
              stories={related.sameProvince}
            />
          ) : null}
          {related.sameCategory.length ? (
            <StorySection
              index={related.sameProvince.length ? 2 : 1}
              icon={Compass}
              title={`เรื่อง${story.category.name.replace(/^เรื่อง/, "")}อื่น ๆ`}
              description={`${story.category.name}เรื่องอื่นจากทั่วแผนที่`}
              stories={related.sameCategory}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
