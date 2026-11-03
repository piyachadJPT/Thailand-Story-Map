import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import type { ListingSort } from "@/lib/seo/listing";

const options: { value: ListingSort; label: string }[] = [
  { value: "recent", label: "ล่าสุด" },
  { value: "popular", label: "ยอดนิยม" },
];

/** ล่าสุด / ยอดนิยม as links (works without JavaScript). */
export default function SortLinks({ value, href }: { value: ListingSort; href: (sort: ListingSort) => string }) {
  return (
    <nav aria-label="เรียงลำดับ" className="flex items-center gap-2">
      {options.map((option) => (
        <Chip key={option.value} asChild variant="outline" size="md" data-selected={option.value === value}>
          <Link href={href(option.value)} aria-current={option.value === value ? "true" : undefined}>
            {option.label}
          </Link>
        </Chip>
      ))}
    </nav>
  );
}
