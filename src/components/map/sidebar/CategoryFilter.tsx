import { Chip } from "@/components/ui/chip";
import { categoryIcon, storyCategories } from "@/config/categories";

type CategoryFilterProps = {
  value: string | null;
  onToggle: (slug: string) => void;
};

/** Category toggle chips, each tinted with its category color. */
export default function CategoryFilter({ value, onToggle }: CategoryFilterProps) {
  return (
    <div role="group" aria-label="หมวดหมู่" className="flex flex-wrap gap-1.5">
      {storyCategories.map((category) => {
        const Icon = categoryIcon(category.slug);
        const selected = value === category.slug;
        return (
          <Chip key={category.slug} asChild category={category.slug}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(category.slug)}
            >
              <Icon aria-hidden="true" />
              {category.name}
            </button>
          </Chip>
        );
      })}
    </div>
  );
}
