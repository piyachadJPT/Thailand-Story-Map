import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  href: (page: number) => string;
};

/** Page numbers around the current one, with gaps marked as null. */
function pageWindow(page: number, total: number): (number | null)[] {
  const pages = new Set([1, total, page - 1, page, page + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? [null, n] : [n]));
}

/** Plain links, so crawlers can follow every page. */
export default function ListingPagination({ page, totalPages, href }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="แบ่งหน้า" className="flex flex-wrap items-center justify-center gap-2 pt-4">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ChevronLeft aria-hidden="true" />
          ก่อนหน้า
        </Link>
      ) : null}
      {pageWindow(page, totalPages).map((n, i) =>
        n === null ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            aria-label={`หน้า ${n}`}
            className={cn(
              buttonVariants({ variant: n === page ? "primary" : "ghost", size: "sm" }),
              "min-w-9 tabular-nums"
            )}
          >
            {n}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={buttonVariants({ variant: "outline", size: "sm" })}>
          ถัดไป
          <ChevronRight aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
