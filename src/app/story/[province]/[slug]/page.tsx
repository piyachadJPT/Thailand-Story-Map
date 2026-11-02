import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoryByProvinceAndSlug } from "@/api/stories/service";
import { NotFoundError } from "@/api/common/errors";
import StoryBody from "@/components/story/StoryBody";
import StoryCover from "@/components/story/StoryCover";
import StoryFooter from "@/components/story/StoryFooter";
import StoryHeader from "@/components/story/StoryHeader";
import StoryMapBackground from "@/components/story/StoryMapBackground";
import StoryReader from "@/components/story/StoryReader";
import { buildStoryView } from "@/components/story/storyView";
import { Notice } from "@/components/ui/notice";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ province: string; slug: string }> };

const readStory = cache(async (province: string, slug: string) => {
  try {
    return await getStoryByProvinceAndSlug(province, slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province, slug } = await params;
  const story = await readStory(province, slug);
  return { title: `${story.title} | TSM`, description: story.summary };
}

export default async function StoryDetailPage({ params }: Props) {
  const { province, slug } = await params;
  const story = await readStory(province, slug);
  const view = buildStoryView(story);

  return (
    <>
      <StoryMapBackground />
      <article className="relative z-10 mx-auto w-full max-w-5xl space-y-10 px-4 pt-4 pb-16 sm:space-y-14 sm:px-6 sm:pt-8">
        <StoryHeader
          title={story.title}
          summary={story.summary}
          categorySlug={story.categorySlug}
          provinceName={view.provinceName}
          mapHref={view.mapHref}
          author={story.author}
          createdAt={story.createdAt}
          viewCount={story.viewCount}
        />
        {view.cover ? (
          <StoryCover url={view.cover.url} alt={view.cover.altText || `ภาพประกอบ ${story.title}`} />
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
            provinceName={view.provinceName}
          />
        </StoryReader>
        <StoryFooter
          title={story.title}
          tags={story.tags}
          source={view.source}
          latitude={story.latitude}
          longitude={story.longitude}
          provinceName={view.provinceName}
          categorySlug={story.categorySlug}
          mapHref={view.mapHref}
        />
      </article>
    </>
  );
}
