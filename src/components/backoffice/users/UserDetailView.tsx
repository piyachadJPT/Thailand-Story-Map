"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, FileText, Flag, Inbox, ShieldBan, ShieldCheck, UserX } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportStatusBadge, StatusBadge, UserStatusBadge } from "@/components/ui/status-badge";
import { backofficeHref } from "@/config/backoffice";
import { reportReasonLabel } from "@/config/reportReasons";
import type { StoryStatus } from "@/models/enums";
import { useAdmin } from "../AdminShell";
import AuditTimeline, { type AuditItem } from "../AuditTimeline";
import Avatar from "../Avatar";
import DataTable, { Pagination, TableSkeleton } from "../DataTable";
import { FilterSelect } from "../Filters";
import { Panel } from "../PageHeader";
import RelativeTime from "../RelativeTime";
import { EmptyBlock, ErrorCard } from "../States";
import { AdminApiError, adminFetch, adminKeys, queryString } from "../api";
import { formatCompact, formatDate, formatNumber } from "../format";
import { storyColumns } from "../stories/storyColumns";
import type { StoryList } from "../stories/types";
import { useUrlState } from "../useUrlState";
import { BanDialog, UnbanDialog } from "./BanDialogs";
import LoginMethod from "./LoginMethod";
import type { UserDetail, UserReports } from "./types";

const tabs = ["stories", "received", "sent", "history"] as const;
type Tab = (typeof tabs)[number];

export default function UserDetailView({ id }: { id: string }) {
  const me = useAdmin();
  const { get, set } = useUrlState();
  const tab = (tabs.includes(get("tab") as Tab) ? get("tab") : "stories") as Tab;
  const [dialog, setDialog] = useState<"BAN" | "UNBAN" | null>(null);
  const [copied, setCopied] = useState(false);
  const [justUnbanned, setJustUnbanned] = useState(false);
  const user = useQuery({
    queryKey: adminKeys.user(id),
    queryFn: ({ signal }) => adminFetch<UserDetail>(`/api/admin/users/${id}`, { signal }),
  });

  if (user.isPending) return <UserDetailSkeleton />;
  if (user.isError || !user.data) {
    if (user.error instanceof AdminApiError && user.error.status === 404) {
      return <EmptyBlock icon={UserX} title="ไม่พบผู้ใช้นี้" />;
    }
    return <ErrorCard error={user.error} onRetry={() => void user.refetch()} />;
  }

  const data = user.data;
  const canModerate = data.role !== "ADMIN" && data.id !== me.id;
  const banned = data.status === "BANNED";

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(data.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the email is still visible to select
    }
  }

  return (
    <div className="space-y-6">
      <Link href={backofficeHref("/users")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="size-4" />
        กลับไปรายชื่อผู้ใช้
      </Link>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-wrap items-start gap-5 p-5 sm:p-6">
          <Avatar id={data.id} name={data.name} image={data.image} size="lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold">{data.name}</h1>
              <UserStatusBadge status={data.status} admin={data.role === "ADMIN" && !banned} />
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="truncate">{data.email}</span>
              <button
                type="button"
                onClick={copyEmail}
                aria-label="คัดลอกอีเมล"
                className="grid size-7 place-items-center rounded-full outline-none hover:bg-foreground/6 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {copied ? <Check aria-hidden="true" className="size-3.5 text-success" /> : <Copy aria-hidden="true" className="size-3.5" />}
              </button>
              <span role="status" className="sr-only">{copied ? "คัดลอกแล้ว" : ""}</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <LoginMethod adminAccount={data.isAdminAccount} />
              <span>
                สมัครเมื่อ <span className="text-foreground tabular-nums">{formatDate(data.createdAt)}</span> (
                <RelativeTime value={data.createdAt} />)
              </span>
            </div>
          </div>
          {canModerate ? (
            banned ? (
              <Button variant="outline" onClick={() => setDialog("UNBAN")}>
                <ShieldCheck aria-hidden="true" />
                ยกเลิกการระงับ
              </Button>
            ) : (
              <Button variant="destructive" onClick={() => setDialog("BAN")}>
                <ShieldBan aria-hidden="true" />
                ระงับผู้ใช้
              </Button>
            )
          ) : null}
        </div>
        {banned ? (
          <div className="border-t border-destructive/25 bg-destructive/8 px-5 py-3 text-sm sm:px-6" role="status">
            <span className="font-medium text-destructive">
              ถูกระงับเมื่อ {data.bannedAt ? formatDate(data.bannedAt) : "—"}
              {data.bannedBy ? ` โดย ${data.bannedBy.username ?? data.bannedBy.name}` : ""}
            </span>
            {data.banReason ? <span className="text-foreground"> — เหตุผล: {data.banReason}</span> : null}
          </div>
        ) : null}
      </section>

      {justUnbanned && !banned ? (
        <Alert title="ยกเลิกการระงับแล้ว">
          เรื่องที่ถูกซ่อนไม่ถูกกู้คืนอัตโนมัติ{" "}
          <Link
            href={backofficeHref(`/users/${data.id}?storyStatus=REJECTED`)}
            className="font-medium text-foreground underline underline-offset-2"
          >
            ดูเรื่องที่ถูกปฏิเสธ/ซ่อนของผู้ใช้นี้
          </Link>
        </Alert>
      ) : null}

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="เรื่องทั้งหมด" value={formatNumber(data.stats.totalStories)} />
        <Stat label="เผยแพร่แล้ว" value={formatNumber(data.stats.published)} />
        <Stat label="ยอดอ่านรวม" value={formatCompact(data.stats.totalViews)} />
        <Stat
          label="รายงานที่ได้รับ (เปิด/ทั้งหมด)"
          value={
            <>
              <span className={data.stats.reportsOpen ? "text-destructive" : undefined}>{formatNumber(data.stats.reportsOpen)}</span>
              <span className="text-muted-foreground"> / {formatNumber(data.stats.reportsTotal)}</span>
            </>
          }
        />
      </dl>

      <div className="space-y-4">
        <SegmentedTabs
          aria-label="ข้อมูลผู้ใช้"
          size="sm"
          scrollable
          className="max-w-full sm:w-fit"
          value={tab}
          onValueChange={(value) => set({ tab: value === "stories" ? null : value, storyStatus: null })}
          items={[
            { value: "stories", label: "เรื่องของผู้ใช้" },
            { value: "received", label: "รายงานที่ได้รับ" },
            { value: "sent", label: "รายงานที่ส่ง" },
            { value: "history", label: "ประวัติการจัดการ" },
          ]}
        />
        {tab === "stories" ? <UserStories id={id} /> : null}
        {tab === "received" ? <UserReportList id={id} kind="received" /> : null}
        {tab === "sent" ? <UserReportList id={id} kind="sent" /> : null}
        {tab === "history" ? <UserHistory id={id} /> : null}
      </div>

      {canModerate ? (
        <>
          <BanDialog
            open={dialog === "BAN"}
            onOpenChange={(open) => setDialog(open ? "BAN" : null)}
            user={{ id: data.id, name: data.name, email: data.email, publishedStories: data.stats.published }}
          />
          <UnbanDialog
            open={dialog === "UNBAN"}
            onOpenChange={(open) => setDialog(open ? "UNBAN" : null)}
            user={data}
            onDone={() => setJustUnbanned(true)}
          />
        </>
      ) : null}

    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-heading text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function UserStories({ id }: { id: string }) {
  const { get, set, page } = useUrlState();
  const status = ["PENDING", "APPROVED", "REJECTED"].includes(get("storyStatus")) ? get("storyStatus") : "";
  const params = { status, page, pageSize: 10 };
  const stories = useQuery({
    queryKey: adminKeys.userTab(id, "stories", params),
    queryFn: ({ signal }) => adminFetch<StoryList>(`/api/admin/users/${id}/stories${queryString(params)}`, { signal }),
    placeholderData: (previous) => previous,
  });
  if (stories.isError) return <ErrorCard error={stories.error} onRetry={() => void stories.refetch()} />;
  return (
    <div className="space-y-3">
      <FilterSelect
        label="สถานะเรื่อง"
        allLabel="ทุกสถานะ"
        value={status}
        onChange={(value) => set({ storyStatus: value })}
        options={[
          { value: "PENDING", label: "รอตรวจ" },
          { value: "APPROVED", label: "เผยแพร่แล้ว" },
          { value: "REJECTED", label: "ปฏิเสธ/ซ่อน" },
        ]}
      />
      <DataTable
        caption="เรื่องของผู้ใช้"
        columns={storyColumns({ pendingTab: false, showAuthor: false })}
        rows={stories.data?.data}
        loading={stories.isPending}
        rowKey={(story) => story.id}
        rowLabel={(story) => story.title}
        rowHref={(story) => backofficeHref(`/stories/${story.id}`)}
        empty={<EmptyBlock icon={FileText} title={status ? "ไม่มีเรื่องในสถานะนี้" : "ผู้ใช้นี้ยังไม่เคยเขียนเรื่อง"} />}
      />
      {stories.data ? (
        <Pagination page={page} pageSize={10} total={stories.data.meta.total} onPageChange={(next) => set({ page: next })} />
      ) : null}
    </div>
  );
}

function UserReportList({ id, kind }: { id: string; kind: "received" | "sent" }) {
  const { set, page } = useUrlState();
  const params = { page, pageSize: 20 };
  const reports = useQuery({
    queryKey: adminKeys.userTab(id, kind, params),
    queryFn: ({ signal }) => adminFetch<UserReports>(`/api/admin/users/${id}/reports-${kind}${queryString(params)}`, { signal }),
    placeholderData: (previous) => previous,
  });
  if (reports.isError) return <ErrorCard error={reports.error} onRetry={() => void reports.refetch()} />;
  if (reports.isPending) return <TableSkeleton columns={4} rows={4} />;
  if (!reports.data?.data.length) {
    return (
      <Panel>
        <EmptyBlock icon={kind === "received" ? Inbox : Flag} title={kind === "received" ? "เรื่องของผู้ใช้นี้ยังไม่เคยถูกรายงาน" : "ผู้ใช้นี้ยังไม่เคยส่งรายงาน"} />
      </Panel>
    );
  }
  return (
    <div>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
        {reports.data.data.map((report) => (
          <li key={report.id} className="flex flex-wrap items-start gap-3 p-4 sm:px-5">
            <Flag aria-hidden="true" className="mt-1 size-4 shrink-0 text-destructive" strokeWidth={1.75} />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">{reportReasonLabel(report.reasonType)}</span>
                <span className="text-muted-foreground"> · </span>
                <Link href={backofficeHref(`/stories/${report.story.id}`)} className="underline-offset-2 hover:underline">
                  {report.story.title}
                </Link>
              </p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{report.reason}</p>
              <p className="text-xs text-muted-foreground">
                {kind === "received" ? `${report.reporter?.name ?? "ไม่ระบุตัวตน"} · ` : null}
                <RelativeTime value={report.createdAt} />
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <ReportStatusBadge status={report.status} className="h-6 px-2" />
              <StatusBadge status={report.story.status as StoryStatus} className="h-6 px-2" />
            </div>
          </li>
        ))}
      </ul>
      <Pagination page={page} pageSize={20} total={reports.data.meta.total} onPageChange={(next) => set({ page: next })} />
    </div>
  );
}

function UserHistory({ id }: { id: string }) {
  const history = useQuery({
    queryKey: adminKeys.userTab(id, "history", {}),
    queryFn: ({ signal }) => adminFetch<AuditItem[]>(`/api/admin/users/${id}/history`, { signal }),
  });
  if (history.isError) return <ErrorCard error={history.error} onRetry={() => void history.refetch()} />;
  return (
    <Panel>
      {history.isPending ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <AuditTimeline items={history.data ?? []} />
      )}
    </Panel>
  );
}

export function UserDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">กำลังโหลด…</span>
      <div className="flex gap-5 rounded-2xl border border-border bg-card p-6">
        <Skeleton className="size-[72px] rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-96 max-w-full rounded-full" />
      <TableSkeleton columns={5} rows={4} />
    </div>
  );
}
