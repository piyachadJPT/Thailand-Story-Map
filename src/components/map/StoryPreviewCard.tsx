import { ArrowRight, Eye, MapPin, X } from "lucide-react";
import type { StoryMapPoint } from "@/models/types/story";
import { buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { categoryIcon, isCategorySlug, storyCategories } from "@/config/categories";
import { provinceRecords } from "@/lib/thai-provinces";
import { cn } from "@/lib/utils";
import { storyPath } from "@/lib/seo/url";

type StoryPreviewCardProps = {
  story: StoryMapPoint;
  onClose: () => void;
};

/** Map popup body: category, title, place and reads, summary, read link. */
export default function StoryPreviewCard({ story, onClose }: StoryPreviewCardProps) {
  const category = storyCategories.find((item) => item.slug === story.categorySlug);
  const province = provinceRecords.find((item) => item.slug === story.provinceSlug);

  return (
    <article
      tabIndex={0}
      aria-label={`รายละเอียด ${story.title}`}
      className="max-h-[min(24rem,50dvh)] overflow-y-auto overscroll-contain rounded-panel p-5 outline-none [scrollbar-width:none] focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset"
    >
      <div className="flex items-start justify-between gap-3">
        <Chip
          category={isCategorySlug(story.categorySlug) ? story.categorySlug : undefined}
          variant={isCategorySlug(story.categorySlug) ? "category" : "default"}
          icon={categoryIcon(story.categorySlug)}
        >
          {category?.name ?? "เรื่องราว"}
        </Chip>
        <IconButton
          size="sm"
          className="-mt-1.5 -mr-1.5"
          aria-label="ปิดรายละเอียดเรื่องราว"
          onClick={onClose}
        >
          <X />
        </IconButton>
      </div>

      <h3 className="mt-3 font-heading text-lg font-semibold text-foreground wrap-anywhere">
        {story.title}
      </h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
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

      <div aria-hidden="true" className="my-3 h-px bg-linear-to-r from-gold/50 to-transparent" />

      <p className="text-sm whitespace-pre-line text-foreground/85 wrap-anywhere">
        {story.summary}
      </p>

      <a
        href={storyPath(story.provinceSlug, story.slug)}
        className={cn(buttonVariants({ size: "md" }), "group/read mt-4 w-full")}
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
