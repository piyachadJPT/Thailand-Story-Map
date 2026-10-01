import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ArrowUpRight,
  CalendarDays,
  Eye,
  MapPin,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { UserAvatar } from "@/components/auth/AuthControls";
import { getStoryByProvinceAndSlug } from "@/api/stories/service";
import { NotFoundError } from "@/api/common/errors";
import { storyCategories } from "@/config/categories";
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
  const paragraphs = story.content
    .split(/\r?\n\s*\r?\n/)
    .filter((paragraph) => paragraph.trim());

  return (
    <MainLayout>
      <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={mapHref}
          className="text-muted-foreground hover:text-primary mb-8 inline-flex min-h-11 items-center gap-2 rounded-full text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปยังหมุดบนแผนที่
        </Link>
        <header className="mb-8">
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
          <h1 className="font-heading text-foreground text-3xl leading-snug font-semibold tracking-tight break-words sm:text-5xl">
            {story.title}
          </h1>
          <p className="text-muted-foreground mt-5 text-base leading-loose break-words whitespace-pre-wrap sm:text-lg">
            {story.summary}
          </p>
          <div className="border-border text-muted-foreground mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t pt-5 text-xs sm:text-sm">
            <span className="flex items-center gap-2.5">
              <UserAvatar name={story.author.name} image={story.author.image} />
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
        </header>
        {story.isSensitive && (
          <p className="text-foreground mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm leading-relaxed">
            เรื่องนี้มีเนื้อหาเกี่ยวกับเหตุการณ์อ่อนไหว
            โปรดใช้วิจารณญาณในการอ่าน
          </p>
        )}
        <div className="glass-card rounded-[1.6rem] px-5 py-7 sm:px-10 sm:py-10">
          <div className="text-foreground space-y-6 text-base leading-[2] sm:text-lg">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="[overflow-wrap:anywhere] break-words whitespace-pre-wrap"
              >
                {paragraph}
              </p>
            ))}
          </div>
          {story.images.length > 0 && (
            <div className="mt-8 space-y-6">
              {story.images
                .filter((image) => externalUrl(image.url))
                .map((image) => (
                  <figure key={image.id}>
                    {/* Uploaded images may use external storage URLs. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.altText || `ภาพประกอบ ${story.title}`}
                      loading="lazy"
                      className="h-auto max-h-[36rem] w-full rounded-2xl object-contain"
                    />
                    {image.altText && (
                      <figcaption className="text-muted-foreground mt-2 text-center text-xs">
                        {image.altText}
                      </figcaption>
                    )}
                  </figure>
                ))}
            </div>
          )}
          {story.tags.length > 0 && (
            <div
              className="border-border mt-8 flex flex-wrap gap-2 border-t pt-6"
              aria-label="แท็กเรื่องราว"
            >
              {story.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-primary/8 text-primary rounded-full px-3 py-1.5 text-xs font-medium"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
          {sourceUrl && (
            <div className="border-border mt-8 border-t pt-6">
              <h2 className="text-foreground text-sm font-semibold">
                แหล่งข้อมูลอ้างอิง
              </h2>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary mt-2 inline-flex items-start gap-2 text-sm break-all hover:underline"
              >
                {sourceUrl}
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" />
              </a>
            </div>
          )}
        </div>
        <section
          className="glass-card mt-6 flex flex-col gap-4 rounded-[1.6rem] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          aria-label="ตำแหน่งเรื่องราว"
        >
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
              <MapPin className="text-primary h-5 w-5" />
              เรื่องนี้เกิดขึ้นที่{provinceName}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              กลับไปดูตำแหน่งจริง และสำรวจเรื่องราวรอบ ๆ
            </p>
          </div>
          <Link
            href={mapHref}
            className="bg-primary text-primary-foreground inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            <MapPin className="h-4 w-4" />
            ดูหมุดบนแผนที่
          </Link>
        </section>
      </article>
    </MainLayout>
  );
}
