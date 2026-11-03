import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StoryListItem } from "@/models/types/story";
import { Chip } from "@/components/ui/chip";
import { categoryIcon, isCategorySlug, storyCategories } from "@/config/categories";
import { provinceRecords } from "@/lib/thai-provinces";
import { storyPath } from "@/lib/seo/url";

type ResultItemProps = {
  story: StoryListItem;
  onSelect: (story: StoryListItem) => void;
};

/** Story result: the card flies to the pin; "อ่าน" opens the story page. */
export default function ResultItem({ story, onSelect }: ResultItemProps) {
  const province = provinceRecords.find((item) => item.slug === story.provinceSlug);
  const category = storyCategories.find((item) => item.slug === story.categorySlug);
  const slug = isCategorySlug(story.categorySlug) ? story.categorySlug : undefined;

  return (
    <li className="group/result relative rounded-2xl border border-border bg-card/50 transition-colors hover:border-gold/50 hover:bg-card/80">
      <button
        type="button"
        onClick={() => onSelect(story)}
        className="block w-full rounded-2xl p-3.5 pr-16 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Chip category={slug} icon={categoryIcon(story.categorySlug)}>
            {category?.name ?? story.categorySlug}
          </Chip>
          {province?.name ?? story.provinceSlug}
        </span>
        <span className="mt-2 block font-heading text-sm font-semibold text-foreground">
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
        className="absolute top-3 right-3 inline-flex h-8 items-center rounded-full border border-border bg-background/60 px-3 text-xs font-semibold text-foreground outline-none transition-colors hover:border-gold hover:bg-gold/15 focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        อ่าน
      </Link>
    </li>
  );
}
