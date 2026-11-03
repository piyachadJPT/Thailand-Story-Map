import { createElement } from "react";
import Link from "next/link";
import { BookOpen, Eye, MapPin, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { categoryColor, categoryIcon } from "@/config/categories";
import type { MyStory } from "./myStory";
import { storyPath } from "@/lib/seo/url";

/** One of my stories: cover, status, details, and read / edit actions. */
export default function MyStoryRow({ story }: { story: MyStory }) {
  return (
    <article
      style={{ "--tint": categoryColor(story.categorySlug) } as React.CSSProperties}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur-sm sm:flex-row sm:items-center sm:p-5"
    >
      {story.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.cover.url}
          alt={story.cover.altText || `รูปปก ${story.title}`}
          className="aspect-video w-full shrink-0 rounded-xl object-cover ring-1 ring-border sm:aspect-square sm:w-28"
        />
      ) : (
        <span
          aria-hidden="true"
          className="hidden size-28 shrink-0 place-items-center rounded-xl bg-(--tint)/10 text-(--tint) ring-1 ring-(--tint)/25 sm:grid"
        >
          {createElement(categoryIcon(story.categorySlug), { className: "size-8" })}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <StatusBadge status={story.status} />
          <span>{story.categoryName}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden="true" className="size-3.5 text-gold-ink" />
            {story.provinceName}
          </span>
        </div>
        <h2 className="font-heading text-lg font-semibold text-foreground wrap-anywhere">{story.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground wrap-anywhere">{story.summary}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
          <span>
            แก้ไขล่าสุด{" "}
            <time dateTime={story.updatedAt}>
              {new Date(story.updatedAt).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Asia/Bangkok",
              })}
            </time>
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye aria-hidden="true" className="size-3.5" />
            อ่าน {story.viewCount.toLocaleString("th-TH")} ครั้ง
          </span>
        </p>
        {story.status === "REJECTED" && story.rejectReason ? (
          <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            เหตุผล: {story.rejectReason}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2 sm:flex-col">
        {story.status === "APPROVED" ? (
          <Link
            href={storyPath(story.provinceSlug, story.slug)}
            aria-label={`อ่านเรื่อง ${story.title}`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1 sm:flex-none" })}
          >
            <BookOpen aria-hidden="true" />
            อ่าน
          </Link>
        ) : null}
        <Link
          href={`/story/edit/${story.id}`}
          aria-label={`แก้ไขเรื่อง ${story.title}`}
          className={buttonVariants({ size: "sm", className: "flex-1 sm:flex-none" })}
        >
          <Pencil aria-hidden="true" />
          แก้ไข
        </Link>
      </div>
    </article>
  );
}
