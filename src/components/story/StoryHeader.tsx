import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { GoldDivider } from "@/components/ui/gold-divider";
import CategoryChip from "./CategoryChip";
import StoryMeta from "./StoryMeta";

type StoryHeaderProps = {
  title: string;
  summary: string;
  categorySlug: string;
  provinceName: string;
  mapHref: string;
  author: { name: string; image: string | null };
  createdAt: string;
  viewCount: number;
};

/** Back link, chips, title, deck and meta — the article's opening. */
export default function StoryHeader(props: StoryHeaderProps) {
  return (
    <header className="mx-auto max-w-170 space-y-6">
      <Link
        href={props.mapHref}
        className="inline-flex min-h-11 items-center gap-2 rounded-full pr-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <span className="grid size-9 place-items-center rounded-full border border-border bg-card/70">
          <ArrowLeft aria-hidden="true" className="size-4" />
        </span>
        กลับไปยังหมุดบนแผนที่
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <CategoryChip slug={props.categorySlug} size="md" />
        <Chip asChild variant="outline" size="md">
          <Link href={props.mapHref}>
            <MapPin aria-hidden="true" className="text-gold-ink" />
            {props.provinceName}
          </Link>
        </Chip>
      </div>

      <div className="space-y-4">
        <p className="inline-flex items-center gap-2 text-xs font-medium tracking-widest text-gold-ink">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          Thailand Story Map · เรื่องเล่าจากพิกัดจริง
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground wrap-anywhere sm:text-5xl">
          {props.title}
        </h1>
        <p className="text-lg whitespace-pre-wrap text-muted-foreground wrap-anywhere">
          {props.summary}
        </p>
      </div>

      <GoldDivider strength="subtle" />
      <StoryMeta author={props.author} createdAt={props.createdAt} viewCount={props.viewCount} />
    </header>
  );
}
