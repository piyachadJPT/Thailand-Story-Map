import { Skeleton } from "@/components/ui/skeleton";

/** [heading width, number of cards, text lines per card] */
const groups = [
  { heading: "w-14", cards: 2, lines: 1 },
  { heading: "w-16", cards: 3, lines: 2 },
] as const;

/** Placeholder for the result list while a search is loading. */
export default function SidebarSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-5">
      {groups.map((group) => (
        <div key={group.heading} className="space-y-2">
          <Skeleton className={`h-2 ${group.heading} rounded-full bg-gold/25`} />
          {Array.from({ length: group.cards }, (_, card) => (
            <div
              key={card}
              className="space-y-2 rounded-lg border border-dashed border-border p-3.5"
            >
              <Skeleton className="h-3.5 w-2/3 rounded-full" />
              <Skeleton className="h-2.5 w-full rounded-full" />
              {group.lines > 1 ? (
                <Skeleton className="h-2.5 w-4/5 rounded-full" />
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
