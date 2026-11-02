import { Chip, type ChipProps } from "@/components/ui/chip";
import { categoryIcon, isCategorySlug, storyCategories } from "@/config/categories";

type CategoryChipProps = Omit<ChipProps, "category" | "icon" | "children"> & {
  slug: string;
};

/** Category name with its icon and color, from config/categories. */
export default function CategoryChip({ slug, variant, ...props }: CategoryChipProps) {
  const known = isCategorySlug(slug);
  const name = storyCategories.find((item) => item.slug === slug)?.name ?? "เรื่องราว";
  return (
    <Chip
      category={known ? slug : undefined}
      variant={known ? (variant ?? "category") : (variant ?? "default")}
      icon={categoryIcon(slug)}
      {...props}
    >
      {name}
    </Chip>
  );
}
