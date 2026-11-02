import { storyCategories } from "@/config/categories";
import CategoryCard from "./CategoryCard";

/**
 * Bento layout on desktop (one large feature tile + four smaller ones),
 * two columns on tablets, a single column on phones.
 */
const spans = [
  "sm:col-span-2 lg:col-span-4 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-3",
  "sm:col-span-2 lg:col-span-3",
];

export default function CategoryGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {storyCategories.map((category, index) => (
        <li key={category.slug} className={spans[index]}>
          <CategoryCard
            slug={category.slug}
            name={category.name}
            hint={category.hint}
            href="/"
            feature={index === 0}
          />
        </li>
      ))}
    </ul>
  );
}
