import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSkeleton } from "@/components/backoffice/dashboard/Dashboard";

export default function Loading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <DashboardSkeleton />
    </div>
  );
}
