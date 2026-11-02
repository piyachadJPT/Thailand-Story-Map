"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown, EyeOff, Flag, Inbox, ThumbsDown } from "lucide-react";
import type { listReportGroups } from "@/api/admin/reports";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { backofficeHref } from "@/config/backoffice";
import { reportReasonLabel, reportReasons } from "@/config/reportReasons";
import type { StoryStatus } from "@/models/enums";
import type { Jsonify } from "@/models/types/admin";
import { cn } from "@/lib/utils";
import { Pagination } from "../DataTable";
import { ClearFilters, FilterSelect, TabLabel } from "../Filters";
import PageHeader from "../PageHeader";
import ReasonDialog from "../ReasonDialog";
import RelativeTime from "../RelativeTime";
import { EmptyBlock, ErrorCard, NoResults } from "../States";
import { adminFetch, adminKeys, queryString } from "../api";
import { formatNumber } from "../format";
import { useResolveReports } from "../moderation";
import { useUrlState } from "../useUrlState";

type ReportGroups = Jsonify<Awaited<ReturnType<typeof listReportGroups>>>;
type Group = ReportGroups["data"][number];
const PAGE_SIZE = 10;

export default function ReportsView() {
  const { get, set, page } = useUrlState();
  const status = get("status") === "RESOLVED" ? "RESOLVED" : "OPEN";
  const reasonType = get("reasonType");
  const filters = { status, reasonType, page, pageSize: PAGE_SIZE };
  const groups = useQuery({
    queryKey: adminKeys.reports(filters),
    queryFn: ({ signal }) => adminFetch<ReportGroups>(`/api/admin/reports${queryString(filters)}`, { signal }),
    placeholderData: (previous) => previous,
  });
  const counts = groups.data?.counts;

  return (
    <div className="space-y-6">
      <PageHeader title="รายงาน" description="รายงานจากผู้อ่าน จัดกลุ่มตามเรื่อง เรื่องที่ถูกรายงานมากที่สุดขึ้นก่อน">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedTabs
            aria-label="สถานะรายงาน"
            size="sm"
            className="w-fit"
            value={status}
            onValueChange={(value) => set({ status: value === "OPEN" ? null : value })}
            items={[
              { value: "OPEN", label: <TabLabel label="เปิดอยู่" count={counts?.OPEN} /> },
              { value: "RESOLVED", label: <TabLabel label="จัดการแล้ว" count={counts?.RESOLVED} /> },
            ]}
          />
          <FilterSelect
            label="ประเภทรายงาน"
            allLabel="ทุกประเภท"
            value={reasonType}
            onChange={(value) => set({ reasonType: value })}
            options={reportReasons.map((reason) => ({ value: reason.value, label: reason.label }))}
          />
          {reasonType ? <ClearFilters onClick={() => set({ reasonType: null })} /> : null}
        </div>
      </PageHeader>

      {groups.isError && !groups.data ? (
        <ErrorCard error={groups.error} onRetry={() => void groups.refetch()} />
      ) : groups.isPending ? (
        <ReportsSkeleton />
      ) : !groups.data?.data.length ? (
        reasonType ? (
          <NoResults onClear={() => set({ reasonType: null })} />
        ) : status === "OPEN" ? (
          <EmptyBlock icon={CheckCircle2} tone="success" title="ไม่มีรายงานที่รอจัดการ" text="ชุมชนสงบดี" />
        ) : (
          <EmptyBlock icon={Inbox} title="ยังไม่มีรายงานที่จัดการแล้ว" />
        )
      ) : (
        <div>
          <ul className="grid gap-4">
            {groups.data.data.map((group) => (
              <ReportGroupCard key={group.story.id} group={group} open={status === "OPEN"} />
            ))}
          </ul>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={groups.data.meta.total}
            onPageChange={(next) => set({ page: next })}
          />
        </div>
      )}
    </div>
  );
}

function ReportGroupCard({ group, open }: { group: Group; open: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [dialog, setDialog] = useState<"DISMISS" | "HIDE_STORY" | null>(null);
  const resolve = useResolveReports();
  const listId = `reports-${group.story.id}`;
  const shown = expanded ? group.reports : group.reports.slice(0, 2);

  return (
    <li className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-start gap-4 p-5 sm:p-6">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full",
            open ? "bg-destructive/12 text-destructive" : "bg-foreground/5 text-muted-foreground"
          )}
        >
          <Flag aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={backofficeHref(`/stories/${group.story.id}`)}
              className="min-w-0 font-medium text-foreground underline-offset-2 hover:underline"
            >
              {group.story.title}
            </Link>
            <StatusBadge status={group.story.status as StoryStatus} className="h-6 px-2" />
          </div>
          <p className="text-xs text-muted-foreground">
            {group.story.province.name} · โดย {group.story.author.name}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(group.byType).map(([type, count]) => (
              <span key={type} className="inline-flex h-6 items-center gap-1 rounded-full border border-border px-2.5 text-xs">
                {reportReasonLabel(type)}
                <span className="font-semibold tabular-nums">{formatNumber(count)}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn("font-heading text-2xl font-semibold tabular-nums", open && "text-destructive")}>
            {formatNumber(group.count)}
          </span>
          <span className="text-xs text-muted-foreground">รายงาน</span>
        </div>
      </div>

      <ul id={listId} className="space-y-2 border-t border-border px-5 py-4 sm:px-6">
        {shown.map((report) => (
          <li key={report.id} className="rounded-xl bg-foreground/3 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{reportReasonLabel(report.reasonType)}</span>
              <span className="text-xs text-muted-foreground">
                {report.reporter?.name ?? "ไม่ระบุตัวตน"} · <RelativeTime value={report.createdAt} />
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{report.reason}</p>
            {!open && report.resolvedAt ? (
              <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                {report.resolution === "STORY_HIDDEN" ? "ซ่อนเรื่อง" : "ไม่มีมูล"} โดย{" "}
                <span className="font-medium text-foreground">
                  {report.resolvedBy?.username ?? report.resolvedBy?.name ?? "—"}
                </span>{" "}
                · <RelativeTime value={report.resolvedAt} />
                {report.resolvedNote ? <> — {report.resolvedNote}</> : null}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3 sm:px-6">
        {group.reports.length > 2 ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform", expanded && "rotate-180")} />
            {expanded ? "ย่อ" : `ดูทั้งหมด ${formatNumber(group.reports.length)} รายการ`}
          </button>
        ) : (
          <span />
        )}
        {open ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setDialog("DISMISS")} disabled={resolve.isPending}>
              <ThumbsDown aria-hidden="true" />
              ไม่มีมูล
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDialog("HIDE_STORY")} disabled={resolve.isPending}>
              <EyeOff aria-hidden="true" />
              ซ่อนเรื่อง
            </Button>
          </div>
        ) : null}
      </div>

      <ReasonDialog
        open={dialog !== null}
        onOpenChange={(next) => !next && setDialog(null)}
        title={dialog === "DISMISS" ? "ปิดรายงานว่าไม่มีมูล?" : "ซ่อนเรื่องและปิดรายงาน?"}
        target={group.story.title}
        description={
          dialog === "DISMISS"
            ? `จะปิดรายงานที่เปิดอยู่ทั้งหมด ${group.count} รายการ เรื่องยังเผยแพร่ตามเดิม`
            : group.story.status === "APPROVED"
              ? "เรื่องจะหายจากแผนที่ทันที และปิดรายงานที่เปิดอยู่ทั้งหมด"
              : "เรื่องนี้ไม่ได้เผยแพร่อยู่แล้ว จะปิดรายงานที่เปิดอยู่ทั้งหมดเท่านั้น"
        }
        reasonLabel={dialog === "DISMISS" ? "หมายเหตุ" : "เหตุผล"}
        optional={dialog === "DISMISS"}
        presets={dialog === "DISMISS" ? ["ตรวจแล้วข้อมูลถูกต้อง", "ไม่ละเมิดแนวทางชุมชน"] : undefined}
        tone={dialog === "DISMISS" ? "primary" : "destructive"}
        confirmLabel={dialog === "DISMISS" ? "ปิดรายงาน" : "ซ่อนเรื่อง"}
        onConfirm={(note) =>
          resolve.mutateAsync({ storyId: group.story.id, action: dialog ?? "DISMISS", note: note || undefined })
        }
      />
    </li>
  );
}

function ReportsSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <span className="sr-only">กำลังโหลด…</span>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex gap-4">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-6 w-48 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
