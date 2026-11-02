import { Skeleton } from "@/components/ui/skeleton";

const lineWidths = ["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3"];

/** Mirrors the story page layout while it loads. */
export default function StorySkeleton() {
  return (
    <div
      role="status"
      aria-label="กำลังโหลดเรื่องราว"
      className="mx-auto w-full max-w-5xl space-y-10 px-4 pt-4 pb-16 sm:space-y-14 sm:px-6 sm:pt-8"
    >
      <div className="mx-auto max-w-170 space-y-6">
        <Skeleton className="h-9 w-52 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-3 w-56 rounded-full bg-gold/25" />
          <Skeleton className="h-12 w-11/12 rounded-2xl" />
          <Skeleton className="h-12 w-2/3 rounded-2xl" />
          <Skeleton className="h-5 w-full rounded-full" />
          <Skeleton className="h-5 w-4/5 rounded-full" />
        </div>
        <div className="h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
      </div>

      <Skeleton className="aspect-video w-full rounded-panel sm:aspect-21/9" />

      <div className="mx-auto max-w-170 space-y-8">
        <Skeleton className="h-14 w-full rounded-full" />
        <div className="space-y-4">
          {lineWidths.map((width, index) => (
            <Skeleton key={index} className={`h-4 rounded-full ${width}`} />
          ))}
        </div>
      </div>
      <span className="sr-only">กำลังโหลดเรื่องราว…</span>
    </div>
  );
}
