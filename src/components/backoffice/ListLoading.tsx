import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "./DataTable";

/** Route-level skeleton for list pages: header, filters, table. */
export default function ListLoading({ columns = 6 }: { columns?: number }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-10 w-80 max-w-full rounded-full" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-72 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
      <TableSkeleton columns={columns} />
    </div>
  );
}
