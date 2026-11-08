import { ArrowRight, Eye, MapPin, X } from "lucide-react";
import type { StoryMapPoint } from "@/models/types/story";
import { buttonVariants } from "@/components/ui/button";
import { GoldDivider } from "@/components/ui/gold-divider";
import { IconButton } from "@/components/ui/icon-button";
import KrachengCorners from "@/components/ui/kracheng-corners";
import CategoryLabel from "@/components/story/CategoryLabel";
import { provinceRecords } from "@/lib/thai-provinces";
import { cn } from "@/lib/utils";
import { storyPath } from "@/lib/seo/url";

type StoryPreviewCardProps = {
  story: StoryMapPoint;
  onClose: () => void;
};

/**
 * Map popup body: category, title, place and reads, summary, read link.
 * Same size for every story: long titles and summaries end with "…", never a scrollbar.
 */
export default function StoryPreviewCard({ story, onClose }: StoryPreviewCardProps) {
  const province = provinceRecords.find((item) => item.slug === story.provinceSlug);

  return (
    <article
      tabIndex={0}
      aria-label={`รายละเอียด ${story.title}`}
      className="relative flex h-86 w-80 max-w-full flex-col overflow-hidden rounded-panel p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset"
    >
      <KrachengCorners size="sm" className="text-gold" />
      <div className="flex items-start justify-between gap-3">
        <CategoryLabel slug={story.categorySlug} className="mt-1" />
        <IconButton
          size="sm"
          className="-mt-1.5 -mr-1.5"
          aria-label="ปิดรายละเอียดเรื่องราว"
          onClick={onClose}
        >
          <X />
        </IconButton>
      </div>

      <h3
        title={story.title}
        className="mt-2 line-clamp-2 shrink-0 font-heading text-lg font-bold text-foreground wrap-anywhere"
      >
        {story.title}
      </h3>
      <p className="mt-1 flex shrink-0 flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        <MapPin aria-hidden="true" className="size-3.5 text-gold-ink" />
        {province?.name ?? story.provinceSlug}
        {story.viewCount > 0 ? (
          <>
            <span aria-hidden="true">·</span>
            <Eye aria-hidden="true" className="size-3.5" />
            {story.viewCount.toLocaleString("th-TH")} ครั้งที่อ่าน
          </>
        ) : null}
      </p>

      <GoldDivider pattern="lai" strength="subtle" className="my-3" />

      <p className="line-clamp-5 text-sm text-foreground/85 wrap-anywhere">
        {story.summary}
      </p>

      <a
        href={storyPath(story.provinceSlug, story.slug)}
        className={cn(buttonVariants({ size: "md" }), "group/read mt-auto w-full shrink-0")}
      >
        อ่านเรื่องราวทั้งหมด
        <ArrowRight
          aria-hidden="true"
          className="transition-transform group-hover/read:translate-x-0.5 motion-reduce:transition-none"
        />
      </a>
    </article>
  );
}
