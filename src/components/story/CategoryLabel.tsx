import { categoryColor, isCategorySlug, storyCategories } from "@/config/categories";
import { cn } from "@/lib/utils";

type CategoryLabelProps = {
  slug: string;
  className?: string;
};

/**
 * Public-site category marker: a dot in the category color plus the name.
 * Replaces tinted chips on cards (the backoffice keeps CategoryChip).
 */
export default function CategoryLabel({ slug, className }: CategoryLabelProps) {
  const name = storyCategories.find((item) => item.slug === slug)?.name ?? "เรื่องราว";
  const color = isCategorySlug(slug) ? categoryColor(slug) : "var(--gold)";
  return (
    <span
      data-slot="category-label"
      className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/85", className)}
    >
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}
