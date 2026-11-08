import { createElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, MapPin } from "lucide-react";
import type { StoryListItem } from "@/models/types/story";
import { categoryColor, categoryIcon } from "@/config/categories";
import { isOptimizableImage } from "@/lib/seo/images";
import { provinceRecords } from "@/lib/thai-provinces";
import CategoryLabel from "./CategoryLabel";
import { storyPath } from "@/lib/seo/url";

type StoryCardProps = {
  story: StoryListItem;
  /** Shows a gold step number (route rows). */
  step?: number;
};

/** Story teaser: cover, category, title, summary, province and reads. */
export default function StoryCard({ story, step }: StoryCardProps) {
  const province =
    provinceRecords.find((item) => item.slug === story.provinceSlug)?.name ?? story.provinceSlug;

  return (
    <Link
      href={storyPath(story.provinceSlug, story.slug)}
      style={{ "--tint": categoryColor(story.categorySlug) } as React.CSSProperties}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card outline-none transition-colors duration-200 hover:border-(--tint) focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
    >
      {/* w-full + shrink-0: Safari otherwise collapses an aspect-ratio box in a column flexbox to 0px. */}
      <span className="relative block aspect-16/10 w-full shrink-0 overflow-hidden border-b border-border bg-(--tint)/10">
        {story.coverUrl ? (
          <Image
            src={story.coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            unoptimized={!isOptimizableImage(story.coverUrl)}
            className="object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center text-(--tint)/60">
            {createElement(categoryIcon(story.categorySlug), {
              "aria-hidden": true,
              strokeWidth: 1.25,
              className: "size-12",
            })}
          </span>
        )}
      </span>

      <span className="flex flex-1 flex-col p-5">
        <span className="flex items-center justify-between gap-2">
          <CategoryLabel slug={story.categorySlug} />
          {step ? (
            <span className="font-heading text-2xl font-bold text-gold-ink tabular-nums">
              {String(step).padStart(2, "0")}
            </span>
          ) : null}
        </span>
        <span className="mt-3 line-clamp-2 font-heading text-lg font-bold text-foreground">
          {story.title}
        </span>
        <span className="mt-2 line-clamp-3 text-sm text-muted-foreground">{story.summary}</span>
        <span className="mt-auto flex items-center gap-4 pt-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden="true" className="size-3.5 text-gold-ink" />
            {province}
          </span>
          {story.viewCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Eye aria-hidden="true" className="size-3.5" />
              {story.viewCount.toLocaleString("th-TH")} ครั้งที่อ่าน
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}
