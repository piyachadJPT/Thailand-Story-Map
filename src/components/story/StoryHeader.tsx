import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { storyCategories } from "@/config/categories";
import type { Crumb } from "@/lib/seo/jsonld";
import { categoryPath } from "@/lib/seo/url";
import { GoldDivider } from "@/components/ui/gold-divider";
import StoryMeta from "./StoryMeta";

type StoryHeaderProps = {
  title: string;
  summary: string;
  categorySlug: string;
  provinceName: string;
  mapHref: string;
  author: { name: string; image: string | null };
  publishedAt: string;
  updatedAt: string;
  viewCount: number;
  breadcrumbs: Crumb[];
};

const kickerLink =
  "rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40";

/** Back link, category · province kicker, title, deck and meta — the article's opening. */
export default function StoryHeader(props: StoryHeaderProps) {
  const categoryName =
    storyCategories.find((item) => item.slug === props.categorySlug)?.name ?? "เรื่องราว";

  return (
    <header className="w-full space-y-6">
      <Breadcrumbs items={props.breadcrumbs} />
      {/* <Link
        href={props.mapHref}
        prefetch={false}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        กลับไปยังหมุดบนแผนที่
      </Link> */}

      <div className="space-y-4">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-gold-ink">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          <Link href={categoryPath(props.categorySlug)} className={kickerLink}>
            {categoryName}
          </Link>
          <span aria-hidden="true">·</span>
          <Link href={props.mapHref} prefetch={false} className={kickerLink}>
            {props.provinceName}
          </Link>
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground wrap-anywhere sm:text-5xl">
          {props.title}
        </h1>
        <p className="text-md whitespace-pre-wrap text-muted-foreground wrap-anywhere">
          {props.summary}
        </p>
      </div>

      <GoldDivider strength="subtle" />
      <StoryMeta
        author={props.author}
        publishedAt={props.publishedAt}
        updatedAt={props.updatedAt}
        viewCount={props.viewCount}
      />
    </header>
  );
}
