"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  FileCheck2,
  Flag,
  Hourglass,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { backofficeHref } from "@/config/backoffice";
import { cn } from "@/lib/utils";
import { useAdmin } from "../AdminShell";
import PageHeader, { Panel } from "../PageHeader";
import { ErrorCard } from "../States";
import { adminFetch, adminKeys } from "../api";
import { formatDuration, formatTime, greeting } from "../format";
import { useUrlState } from "../useUrlState";
import { ActivityFeed, NeedsAttention, TopStories } from "./Feeds";
import KpiCard from "./KpiCard";
import type { Overview } from "./types";

const chartSkeleton = () => <Skeleton className="h-80 w-full rounded-2xl" />;
const DailyStoriesChart = dynamic(
  () => import("./Charts").then((mod) => mod.DailyStoriesChart),
  {
    ssr: false,
    loading: chartSkeleton,
  }
);
const CategoryDonut = dynamic(
  () => import("./Charts").then((mod) => mod.CategoryDonut),
  {
    ssr: false,
    loading: chartSkeleton,
  }
);
const ProvinceBars = dynamic(
  () => import("./Charts").then((mod) => mod.ProvinceBars),
  {
    ssr: false,
    loading: chartSkeleton,
  }
);
const DensityMap = dynamic(() => import("./DensityMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full rounded-xl sm:h-96" />,
});

const ranges = [
  { value: "7", label: "7 วัน" },
  { value: "30", label: "30 วัน" },
  { value: "90", label: "90 วัน" },
] as const;

export default function Dashboard({ mapboxToken }: { mapboxToken?: string }) {
  const admin = useAdmin();
  const { get, set } = useUrlState();
  const range = ["7", "90"].includes(get("range")) ? Number(get("range")) : 30;
  const overview = useQuery({
    queryKey: adminKeys.overview(range),
    queryFn: ({ signal }) =>
      adminFetch<Overview>(`/api/admin/overview?range=${range}`, { signal }),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  });
  const data = overview.data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="ภาพรวม"
        // description={`${greeting()}, ${admin.username ?? admin.name}`}
        actions={
          <>
            {data ? (
              <span className="text-muted-foreground text-xs tabular-nums">
                อัปเดต {formatTime(data.generatedAt)} น.
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => void overview.refetch()}
              disabled={overview.isFetching}
              aria-label="รีเฟรชข้อมูล"
              className="text-muted-foreground hover:bg-foreground/6 hover:text-foreground focus-visible:ring-ring/40 grid size-9 place-items-center rounded-full transition-colors outline-none focus-visible:ring-3 disabled:opacity-60"
            >
              <RefreshCw
                aria-hidden="true"
                className={cn("size-4", overview.isFetching && "animate-spin")}
              />
            </button>
            <SegmentedTabs
              aria-label="ช่วงเวลา"
              size="sm"
              items={ranges}
              value={String(range) as (typeof ranges)[number]["value"]}
              onValueChange={(value) =>
                set({ range: value === "30" ? null : value })
              }
              className="w-56"
            />
          </>
        }
      />

      {overview.isError && !data ? (
        <ErrorCard
          error={overview.error}
          onRetry={() => void overview.refetch()}
        />
      ) : !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="border-border bg-border overflow-hidden rounded-2xl border">
            <div className="flex snap-x gap-px overflow-x-auto sm:grid sm:grid-cols-2 sm:overflow-visible xl:grid-cols-5 sm:[&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1">
              <KpiCard
                label="เรื่องที่เผยแพร่ใหม่"
                icon={FileCheck2}
                value={data.kpis.published.value}
                change={data.kpis.published.change}
                spark={data.kpis.published.spark}
                sparkColor="var(--success)"
                note={`${range} วันล่าสุด`}
                href={backofficeHref("/stories?status=APPROVED")}
              />
              <KpiCard
                label="ผู้เขียนใหม่"
                icon={UserPlus}
                value={data.kpis.newAuthors.value}
                change={data.kpis.newAuthors.change}
                spark={data.kpis.newAuthors.spark}
                note={`สมัครใน ${range} วันล่าสุด`}
                href={backofficeHref("/users")}
              />
              <KpiCard
                label="ยอดอ่านรวม"
                icon={Eye}
                value={data.kpis.totalViews.value}
                note="สะสมทั้งหมด"
                href={backofficeHref("/stories?status=APPROVED")}
              />
              <KpiCard
                label="รอตรวจสอบ"
                icon={Hourglass}
                value={data.kpis.pending.value}
                tone={data.kpis.pending.value > 0 ? "warning" : "neutral"}
                note={
                  data.kpis.pending.oldestHours !== null
                    ? `เก่าสุดรอ ${formatDuration(data.kpis.pending.oldestHours)}`
                    : "ไม่มีเรื่องรอตรวจ"
                }
                href={backofficeHref("/stories")}
              />
              <KpiCard
                label="รายงานที่เปิดอยู่"
                icon={Flag}
                value={data.kpis.openReports.value}
                tone={
                  data.kpis.openReports.value > 0 ? "destructive" : "neutral"
                }
                spark={data.kpis.openReports.spark}
                sparkColor="var(--destructive)"
                note="ต้องตัดสินใจ"
                href={backofficeHref("/reports")}
              />
            </div>
          </div>

          <NeedsAttention data={data.needsAttention} />

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="min-w-0 lg:col-span-3">
              <DailyStoriesChart series={data.series} range={range} />
            </div>
            <div className="min-w-0 lg:col-span-2">
              <CategoryDonut categories={data.categories} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <Panel
              title="แผนที่ความหนาแน่น"
              description="เรื่องที่เผยแพร่ทั้งหมด · ซูมเข้าเพื่อดูหมุด แล้วคลิกเพื่อเปิดเรื่อง"
              className="min-w-0 lg:col-span-3"
            >
              <DensityMap token={mapboxToken} />
            </Panel>
            <div className="min-w-0 lg:col-span-2">
              <ProvinceBars provinces={data.provinces} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TopStories stories={data.topStories} />
            <ActivityFeed items={data.activity} />
          </div>
        </>
      )}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8" aria-busy="true">
      <span className="sr-only">กำลังโหลด…</span>
      <div className="border-border bg-border grid grid-cols-2 gap-px overflow-hidden rounded-2xl border xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="bg-card space-y-3 p-5 last:col-span-2 xl:last:col-span-1"
          >
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-80 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-96 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
      </div>
    </div>
  );
}
