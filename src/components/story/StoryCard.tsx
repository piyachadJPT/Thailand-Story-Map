import Link from "next/link";
import { Eye, MapPin } from "lucide-react";
import type { StoryListItem } from "@/models/types/story";
import { categoryColor } from "@/config/categories";
import { provinceRecords } from "@/lib/thai-provinces";
import CategoryChip from "./CategoryChip";
import { storyPath } from "@/lib/seo/url";

type StoryCardProps = {
  story: StoryListItem;
  /** Shows a gold step number (route rows). */
  step?: number;
};

/** Story teaser: category, title, summary, province and reads. */
export default function StoryCard({ story, step }: StoryCardProps) {
  const province =
    provinceRecords.find((item) => item.slug === story.provinceSlug)?.name ?? story.provinceSlug;

  return (
    <Link
      href={storyPath(story.provinceSlug, story.slug)}
      style={{ "--tint": categoryColor(story.categorySlug) } as React.CSSProperties}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/80 p-5 shadow-soft outline-none backdrop-blur-sm transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:border-(--tint)/50 hover:shadow-lift focus-visible:ring-3 focus-visible:ring-ring/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-(--tint)/70" />
      <span className="flex items-center justify-between gap-2">
        <CategoryChip slug={story.categorySlug} />
        {step ? (
          <span className="font-heading text-2xl font-semibold text-gold-ink tabular-nums">
            {String(step).padStart(2, "0")}
          </span>
        ) : null}
      </span>
      <span className="mt-4 line-clamp-2 font-heading text-lg font-semibold text-foreground">
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
    </Link>
  );
}
