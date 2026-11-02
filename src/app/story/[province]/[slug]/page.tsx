import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ArrowUpRight,
  CalendarDays,
  Link2,
  Eye,
  MapPin,
} from "lucide-react";
import StoryMapBackground from "@/components/story/StoryMapBackground";
import StoryLocationMap from "@/components/story/StoryLocationMap";
import StoryReader from "@/components/story/StoryReader";
import styles from "./story.module.css";
import { UserAvatar } from "@/components/auth/AuthControls";
import { getStoryByProvinceAndSlug } from "@/api/stories/service";
import { NotFoundError } from "@/api/common/errors";
import { storyCategories } from "@/config/categories";
import { getMapboxToken } from "@/config/mapbox";
import { provinceRecords } from "@/lib/thai-provinces";

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

function externalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province, slug } = await params;
  const story = await readStory(province, slug);
  return { title: `${story.title} | TSM`, description: story.summary };
}

export default async function StoryDetailPage({ params }: Props) {
  const { province, slug } = await params;
  const story = await readStory(province, slug);
  const category = storyCategories.find(
    (item) => item.slug === story.categorySlug
  );
  const provinceName =
    provinceRecords.find((item) => item.slug === story.provinceSlug)?.name ??
    story.provinceSlug;
  const mapHref = `/?story=${encodeURIComponent(story.id)}`;
  const sourceUrl = externalUrl(story.sourceUrl);
  const source = sourceUrl ? new URL(sourceUrl) : null;
  const sourceHost = source?.hostname.replace(/^www\./, "") ?? "";
  const sourcePath = source
    ? `${source.pathname}${source.search}${source.hash}`
    : "";
  const cover = story.images.find((image) => externalUrl(image.url));
  const bodyImages = story.images.filter(
    (image) => externalUrl(image.url) && image.id !== cover?.id
  );
  const galleryLayout =
    bodyImages.length <= 1
      ? "single"
      : bodyImages.length === 2
        ? "pair"
        : "mosaic";
  const paragraphs = story.content
    .split(/\r?\n\s*\r?\n/)
    .filter((paragraph) => paragraph.trim());

  return (
    <>
      <StoryMapBackground />
      <article className="relative z-10 mx-auto w-full max-w-6xl px-[18px] py-6 sm:py-8">
        <header
          className={`liquid-glass overflow-hidden ${styles.articleHero}`}
        >
          <div className={styles.articleHeroText}>
            <Link
              href={mapHref}
              className="border-border bg-background/80 text-foreground hover:bg-background focus-visible:outline-primary mb-5 inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border px-3.5 text-xs font-medium shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              กลับไปยังหมุดบนแผนที่
            </Link>
            <p className="text-muted-foreground mb-4 flex items-center gap-2 text-[0.68rem] leading-relaxed">
              <span className="bg-gold h-1.5 w-1.5 shrink-0 rounded-full" />
              <span className="tracking-[0.14em] uppercase">
                Thailand Story Map
              </span>
              <span>· เรื่องเล่าจากพิกัดจริง</span>
            </p>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">
                <BookOpen className="h-3.5 w-3.5" />
                {category?.name ?? "เรื่องราว"}
              </span>
              <Link
                href={mapHref}
                className="border-border bg-background/70 text-foreground hover:bg-background inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
              >
                <MapPin className="h-3.5 w-3.5" />
                {provinceName}
              </Link>
            </div>
            <h1 className={styles.articleTitle}>{story.title}</h1>
            <p className={styles.articleDeck}>{story.summary}</p>
            <div className="border-border text-muted-foreground mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t pt-5 text-xs sm:text-sm">
              <span className="flex items-center gap-2.5">
                <UserAvatar
                  name={story.author.name}
                  image={story.author.image}
                />
                <span className="text-foreground font-medium">
                  {story.author.name || "ผู้ร่วมแบ่งปัน"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <time dateTime={story.createdAt}>
                  {new Date(story.createdAt).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Asia/Bangkok",
                  })}
                </time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                อ่าน {story.viewCount.toLocaleString("th-TH")} ครั้ง
              </span>
            </div>
          </div>
          <div className={styles.articleMapWrap}>
            <StoryLocationMap
              token={getMapboxToken()}
              latitude={story.latitude}
              longitude={story.longitude}
              title={story.title}
              provinceName={provinceName}
              categorySlug={story.categorySlug}
              href={mapHref}
            />
          </div>
        </header>
        {story.isSensitive && (
          <p className="text-foreground mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm leading-relaxed">
            เรื่องนี้มีเนื้อหาเกี่ยวกับเหตุการณ์อ่อนไหว
            โปรดใช้วิจารณญาณในการอ่าน
          </p>
        )}
        <StoryReader>
          {cover && (
            <figure className={styles.storyBanner}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover.url}
                alt={cover.altText || `ภาพประกอบ ${story.title}`}
              />
            </figure>
          )}
          <div className={styles.articleParagraphs}>
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          {bodyImages.length > 0 && (
            <div className={styles.articleGallery}>
              <p className={styles.galleryLabel}>ภาพประกอบ</p>
              <div
                className={styles.articleFigures}
                data-layout={galleryLayout}
              >
                {bodyImages.map((image, index) => (
                  <figure key={image.id} className={styles.articleFigure}>
                    {/* Uploaded images may use external storage URLs. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.altText || `ภาพประกอบ ${story.title}`}
                      loading="lazy"
                    />
                    <figcaption>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {image.altText || provinceName}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
          <div className={styles.articleEnd} aria-hidden="true">
            <span />
            ✦
            <span />
          </div>
          {(story.tags.length > 0 || sourceUrl) && (
            <footer className={styles.articleFooter}>
              {story.tags.length > 0 && (
                <div className={styles.articleTags} aria-label="แท็กเรื่องราว">
                  {story.tags.map((tag) => (
                    <span key={tag.id} className={styles.articleTag}>
                      <span aria-hidden="true">#</span>
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sourcePanel}
                  title={sourceUrl}
                >
                  <span className={styles.sourceMark} aria-hidden="true">
                    <Link2 />
                  </span>
                  <span className={styles.sourceCopy}>
                    <span className={styles.sourceKicker}>
                      แหล่งข้อมูลอ้างอิง
                    </span>
                    <span className={styles.sourceHost}>{sourceHost}</span>
                    {sourcePath && sourcePath !== "/" && (
                      <span className={styles.sourcePath}>{sourcePath}</span>
                    )}
                  </span>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              )}
            </footer>
          )}
        </StoryReader>
      </article>
    </>
  );
}
