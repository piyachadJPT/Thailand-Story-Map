import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

/** Visible breadcrumb trail; the last item is the current page. */
export default function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="เส้นทางนำทาง" className={cn("text-sm text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.path} className="inline-flex min-w-0 items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="line-clamp-1 font-medium text-foreground">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link
                    href={item.path}
                    prefetch={item.path === "/" ? false : undefined}
                    className="rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    {item.name}
                  </Link>
                  <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-gold-ink" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
