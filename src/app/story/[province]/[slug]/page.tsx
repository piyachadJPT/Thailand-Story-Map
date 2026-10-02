import { cache, createElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ArrowUpRight,
  CalendarDays,
  Link2,
  ChevronRight,
  Eye,
  Clock3,
  ArrowDown,
  MapPin,
} from "lucide-react";
import StoryMapBackground from "@/components/story/StoryMapBackground";
import StoryReader from "@/components/story/StoryReader";
import styles from "./story.module.css";
import MainLayout from "@/components/layout/MainLayout";
import { UserAvatar } from "@/components/auth/AuthControls";
import { getStoryByProvinceAndSlug } from "@/api/stories/service";
import { NotFoundError } from "@/api/common/errors";
import { categoryIcon, storyCategories } from "@/config/categories";
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
  const bodyImages = story.images.filter((image) => externalUrl(image.url));
  const galleryLayout =
    bodyImages.length <= 1 ? "single" : bodyImages.length === 2 ? "pair" : "mosaic";
  const readingMinutes = Math.max(1, Math.ceil(story.content.length / 900));
  const cover = story.images.find((image) => externalUrl(image.url));
  const paragraphs = story.content
    .split(/\r?\n\s*\r?\n/)
    .filter((paragraph) => paragraph.trim());

  return (
    <MainLayout>
      <StoryMapBackground />
      <article className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <div className={styles.articleTopline}>
          <nav aria-label="เส้นทางนำทาง" className="min-w-0">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary focus-visible:outline-primary inline-flex min-h-11 items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  หน้าแรก
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4 shrink-0" />
              </li>
              <li className="min-w-0">
                <span
                  aria-current="page"
                  className="text-foreground [overflow-wrap:anywhere] break-words"
                >
                  {story.title}
                </span>
              </li>
            </ol>
          </nav>
          <Link
            href={mapHref}
            className="bg-black px-4 text-white hover:text-primary inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปยังหมุดบนแผนที่
          </Link>
        </div>
        <header
          className={`liquid-glass mb-8 overflow-hidden rounded-[2rem] ${styles.articleHero}`}
        >
          <div className={styles.articleHeroText}>
            <p className="text-muted-foreground mb-5 flex items-center gap-2 text-xs tracking-[0.18em] uppercase">
              <span className="bg-gold h-1.5 w-1.5 rounded-full" /> Thailand
              Story Map · เรื่องเล่าจากพิกัดจริง
            </p>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">
                <BookOpen className="h-3.5 w-3.5" />
                {category?.name ?? "เรื่องราว"}
              </span>
              <Link
                href={mapHref}
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
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
          {cover ? (
            <figure className={styles.articleCover}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover.url}
                alt={cover.altText || `ภาพประกอบ ${story.title}`}
                className="h-full w-full object-cover"
              />
              <figcaption className={styles.coverCaption}>
                <MapPin className="h-4 w-4" />
                {provinceName}
              </figcaption>
            </figure>
          ) : (
            <div className={styles.articleArtwork} aria-hidden="true">
              <div className={styles.artworkOrbit} />
              <div className={styles.artworkSymbol}>
                {createElement(categoryIcon(story.categorySlug), {
                  strokeWidth: 1,
                })}
              </div>
              <span className={styles.artworkLabel}>
                เรื่องเล่าจาก{provinceName}
              </span>
              <span className={styles.artworkCoordinate}>
                {story.latitude.toFixed(3)}° N · {story.longitude.toFixed(3)}° E
              </span>
            </div>
          )}
        </header>
        <div className="mx-auto max-w-4xl">
          {story.isSensitive && (
            <p className="text-foreground mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm leading-relaxed">
              เรื่องนี้มีเนื้อหาเกี่ยวกับเหตุการณ์อ่อนไหว
              โปรดใช้วิจารณญาณในการอ่าน
            </p>
          )}
          <div className={styles.readingHeading}>
            <span>
              <BookOpen className="h-4 w-4" /> เรื่องราว
            </span>
          </div>
          <StoryReader>
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
          <section
            className="glass-card mt-6 flex flex-col gap-4 rounded-[1.6rem] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            aria-label="ตำแหน่งเรื่องราว"
          >
            <div className="flex items-start gap-2">
              <MapPin className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h2 className="text-foreground text-base font-semibold">
                  เรื่องนี้เกิดขึ้นที่{provinceName}
                </h2>
                <p className="text-muted-foreground mt-2 text-xs">
                  กลับไปดูตำแหน่งจริง และสำรวจเรื่องราวรอบ ๆ
                </p>
              </div>
            </div>
            <Link
              href={mapHref}
              className="bg-primary text-primary-foreground inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              <MapPin className="h-4 w-4" />
              ดูหมุดบนแผนที่
            </Link>
          </section>
        </div>
      </article>
    </MainLayout>
  );
}
