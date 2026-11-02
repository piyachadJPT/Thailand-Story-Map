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
  className?: string;
};

/** A category tile: tinted glow, oversized icon watermark, name and hint. */
export default function CategoryCard({ slug, name, hint, href, feature = false, className }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        tintVariants({ category: slug }),
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/70 p-5 shadow-soft outline-none backdrop-blur-sm sm:p-6",
        "transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:border-(--tint)/50 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "focus-visible:ring-3 focus-visible:ring-ring/40",
        feature ? "min-h-72 sm:p-8" : "min-h-48",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -top-16 -right-16 size-56 rounded-full bg-(--tint)/15 blur-2xl"
      />
      {createElement(categoryIcon(slug), {
        "aria-hidden": true,
        className: cn(
          "absolute top-5 right-5 text-(--tint) opacity-15 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none",
          feature ? "size-40" : "size-24"
        ),
      })}
      <span className="relative grid size-12 place-items-center rounded-full border border-(--tint)/40 bg-(--tint)/10 text-(--tint)">
        {createElement(categoryIcon(slug), { "aria-hidden": true, className: "size-5" })}
      </span>
      <span className="relative mt-auto block pt-10">
        <span
          className={cn(
            "block font-heading font-semibold text-foreground",
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
