import { createElement } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cva } from "class-variance-authority";
import { categoryIcon, type CategorySlug } from "@/config/categories";
import { cn } from "@/lib/utils";

/** Each category sets --tint once; everything inside reads it. */
const tintVariants = cva("", {
  variants: {
    category: {
      ghost: "[--tint:var(--cat-ghost)]",
      history: "[--tint:var(--cat-history)]",
      legend: "[--tint:var(--cat-legend)]",
      crime: "[--tint:var(--cat-crime)]",
      local: "[--tint:var(--cat-local)]",
    },
  },
});

type CategoryCardProps = {
  slug: CategorySlug;
  name: string;
  hint: string;
  href: string;
  /** The large bento tile. */
  feature?: boolean;
  /** Published stories in this category. */
  count?: number;
  className?: string;
};

/** A category tile: category-color top band, faint icon watermark, name and hint. */
export default function CategoryCard({ slug, name, hint, href, feature = false, count, className }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        tintVariants({ category: slug }),
        // A band of the category color along the top edge, like a mural panel.
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border border-t-4 border-t-(--tint) bg-card p-5 outline-none sm:p-6",
        "transition-colors duration-200 hover:border-(--tint) motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        feature ? "min-h-72 sm:p-8" : "min-h-48",
        className
      )}
    >
      {createElement(categoryIcon(slug), {
        "aria-hidden": true,
        strokeWidth: 1.25,
        className: cn("absolute top-5 right-5 text-(--tint) opacity-15", feature ? "size-40" : "size-24"),
      })}
      <span className="relative flex items-center gap-2 text-sm font-semibold text-(--tint)">
        {createElement(categoryIcon(slug), { "aria-hidden": true, className: "size-4" })}
        {count !== undefined ? (
          <span className="text-muted-foreground tabular-nums">
            {count > 0 ? `${count.toLocaleString("th-TH")} เรื่อง` : "ยังไม่มีเรื่อง"}
          </span>
        ) : null}
      </span>
      <span className="relative mt-auto block pt-10">
        <span
          className={cn(
            "block font-heading font-bold text-foreground",
            feature ? "text-3xl sm:text-4xl" : "text-xl"
          )}
        >
          {name}
        </span>
        <span className="mt-1.5 block max-w-md text-sm text-muted-foreground">{hint}</span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="absolute right-5 bottom-5 size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-gold-ink motion-reduce:transition-none sm:right-6 sm:bottom-6"
      />
    </Link>
  );
}
