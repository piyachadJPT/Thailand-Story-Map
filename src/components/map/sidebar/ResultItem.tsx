import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StoryListItem } from "@/models/types/story";
import CategoryLabel from "@/components/story/CategoryLabel";
import { provinceRecords } from "@/lib/thai-provinces";
import { storyPath } from "@/lib/seo/url";

type ResultItemProps = {
  story: StoryListItem;
  onSelect: (story: StoryListItem) => void;
};

/** Story result: the card flies to the pin; "อ่าน" opens the story page. */
export default function ResultItem({ story, onSelect }: ResultItemProps) {
  const province = provinceRecords.find((item) => item.slug === story.provinceSlug);

  return (
    <li className="group/result relative rounded-lg border border-border bg-card transition-colors hover:border-gold">
      <button
        type="button"
        onClick={() => onSelect(story)}
        className="block w-full rounded-lg p-3.5 pr-16 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <CategoryLabel slug={story.categorySlug} />
          <span aria-hidden="true">·</span>
          {province?.name ?? story.provinceSlug}
        </span>
        <span className="mt-1.5 block font-heading text-sm font-bold text-foreground">
          {story.title}
        </span>
        <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
          {story.summary}
        </span>
        <span className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {story.authorName || "ผู้ร่วมแบ่งปัน"} ·{" "}
            {new Date(story.createdAt).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 font-medium text-gold-ink">
            ดูหมุดและรายละเอียด
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </span>
        </span>
      </button>
      <Link
        href={storyPath(story.provinceSlug, story.slug)}
        className="absolute top-3 right-3 inline-flex h-8 items-center rounded-control border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none transition-colors hover:border-gold hover:bg-gold/15 focus-visible:ring-2 focus-visible:ring-ring"
      >
        อ่าน
      </Link>
    </li>
  );
}
