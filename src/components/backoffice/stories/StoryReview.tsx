"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  Flag,
  RotateCcw,
  SkipForward,
  X,
} from "lucide-react";
import CategoryChip from "@/components/story/CategoryChip";
import SourceLink from "@/components/story/SourceLink";
import StoryBody from "@/components/story/StoryBody";
import StoryCover from "@/components/story/StoryCover";
import { buildStoryView } from "@/components/story/storyView";
import { Button, buttonVariants } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportStatusBadge, StatusBadge, UserStatusBadge } from "@/components/ui/status-badge";
import { backofficeHref } from "@/config/backoffice";
import { reportReasonLabel } from "@/config/reportReasons";
import type { StoryStatus } from "@/models/enums";
import type { StoryDetail as PublicStoryDetail } from "@/models/types/story";
import { cn } from "@/lib/utils";
import AuditTimeline from "../AuditTimeline";
import Avatar from "../Avatar";
import { Kbd } from "../CommandPalette";
import { Panel } from "../PageHeader";
import ReasonDialog from "../ReasonDialog";
import RelativeTime from "../RelativeTime";
import { EmptyBlock, ErrorCard } from "../States";
import Tip from "../Tip";
import { AdminApiError, adminFetch, adminKeys } from "../api";
import { formatDateTime, formatNumber } from "../format";
import { useModerateStory, type StoryAction } from "../moderation";
import MiniMap from "./MiniMap";
import type { StoryDetail } from "./types";

function toPublicShape(story: StoryDetail): PublicStoryDetail {
  return {
    id: story.id,
    title: story.title,
    slug: story.slug,
    summary: story.summary,
    latitude: story.latitude,
    longitude: story.longitude,
    categorySlug: story.category.slug,
    categoryColor: null,
    provinceSlug: story.province.slug,
    viewCount: story.viewCount,
    status: story.status as StoryStatus,
    createdAt: story.createdAt,
    content: story.content,
    sourceUrl: story.sourceUrl,
    isSensitive: story.isSensitive,
    rejectReason: story.rejectReason,
    images: story.images,
    tags: story.tags,
    author: { id: story.author.id, name: story.author.name, image: story.author.image },
  };
}

function typingInField(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable=true], [role=dialog]"));
}

export default function StoryReview({ id, mapboxToken }: { id: string; mapboxToken?: string }) {
  const router = useRouter();
  const queueMode = useSearchParams().get("queue") === "1";
  const moderate = useModerateStory();
  const [dialog, setDialog] = useState<"REJECT" | "HIDE" | null>(null);
  const query = useQuery({
    queryKey: adminKeys.story(id),
    queryFn: ({ signal }) => adminFetch<StoryDetail>(`/api/admin/stories/${id}`, { signal }),
  });
  const story = query.data;
  const queue = queueMode ? story?.queue : null;

  const goTo = (storyId: string | null | undefined) => {
    if (storyId) router.push(backofficeHref(`/stories/${storyId}?queue=1`));
    else router.push(backofficeHref("/stories"));
  };

  async function act(action: StoryAction, reason?: string) {
    if (!story) return;
    const nextId = queue?.nextId;
    await moderate.mutateAsync({ id: story.id, action, reason });
    if (queueMode && (action === "APPROVE" || action === "REJECT")) goTo(nextId);
  }

  useEffect(() => {
    if (!story) return;
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || typingInField(event.target) || dialog) return;
      const key = event.key.toLowerCase();
      if (story?.status === "PENDING" && key === "a" && !moderate.isPending) {
        event.preventDefault();
        void act("APPROVE").catch(() => undefined);
      } else if (story?.status === "PENDING" && key === "r") {
        event.preventDefault();
        setDialog("REJECT");
      } else if (queue && key === "j" && queue.nextId) {
        goTo(queue.nextId);
      } else if (queue && key === "k" && queue.previousId) {
        goTo(queue.previousId);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (query.isPending) return <StoryReviewSkeleton />;
  if (query.isError || !story) {
    if (query.error instanceof AdminApiError && query.error.status === 404) {
      return (
        <EmptyBlock
          icon={EyeOff}
          title="ไม่พบเรื่องนี้"
          text="เรื่องอาจถูกลบไปแล้ว"
          action={
            <Link href={backofficeHref("/stories")} className={buttonVariants({ variant: "outline", size: "sm" })}>
              กลับไปหน้ารายการ
            </Link>
          }
        />
      );
    }
    return <ErrorCard error={query.error} onRetry={() => void query.refetch()} />;
  }

  const view = buildStoryView(toPublicShape(story));
  const publicHref = `/story/${story.province.slug}/${story.slug}`;
  const openReports = story.reports.filter((report) => report.status === "OPEN").length;

  const actions = (
    <ActionButtons
      status={story.status}
      pending={moderate.isPending}
      onApprove={() => void act("APPROVE").catch(() => undefined)}
      onReject={() => setDialog("REJECT")}
      onHide={() => setDialog("HIDE")}
      onRestore={() => void act("RESTORE").catch(() => undefined)}
      queue={Boolean(queue)}
    />
  );

  return (
    <div className="pb-24 lg:pb-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backofficeHref(`/stories${story.status === "PENDING" ? "" : `?status=${story.status === "APPROVED" ? "APPROVED" : "REJECTED"}`}`)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          กลับไปรายการเรื่อง
        </Link>
        {queue ? (
          <div className="flex items-center gap-1" aria-label="คิวตรวจ">
            <span className="mr-2 text-sm text-muted-foreground tabular-nums">
              เรื่องที่ <span className="font-medium text-foreground">{formatNumber(queue.position)}</span> จาก{" "}
              {formatNumber(queue.total)}
            </span>
            <Tip label={<>ก่อนหน้า <Kbd>K</Kbd></>}>
              <button
                type="button"
                aria-label="เรื่องก่อนหน้า"
                disabled={!queue.previousId}
                onClick={() => goTo(queue.previousId)}
                className="grid size-9 place-items-center rounded-full outline-none hover:bg-foreground/6 focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-40"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>
            </Tip>
            <Tip label={<>ข้ามไปเรื่องถัดไป <Kbd>J</Kbd></>}>
              <Button variant="outline" size="sm" disabled={!queue.nextId} onClick={() => goTo(queue.nextId)}>
                <SkipForward aria-hidden="true" />
                ข้าม
              </Button>
            </Tip>
            <Tip label={<>ถัดไป <Kbd>J</Kbd></>}>
              <button
                type="button"
                aria-label="เรื่องถัดไป"
                disabled={!queue.nextId}
                onClick={() => goTo(queue.nextId)}
                className="grid size-9 place-items-center rounded-full outline-none hover:bg-foreground/6 focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-40"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </Tip>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <article className="order-2 min-w-0 space-y-8 rounded-2xl border border-border bg-card p-5 sm:p-8 lg:order-1">
          <header className="mx-auto max-w-170 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryChip slug={story.category.slug} size="md" />
              <span className="text-sm text-muted-foreground">{story.province.name}</span>
            </div>
            <h1 className="font-heading text-2xl leading-snug font-semibold sm:text-3xl">{story.title}</h1>
            <p className="text-base text-muted-foreground">{story.summary}</p>
          </header>
          {view.cover ? <StoryCover url={view.cover.url} alt={view.cover.altText || story.title} /> : null}
          {story.isSensitive ? (
            <Notice className="mx-auto max-w-170">เรื่องนี้ถูกทำเครื่องหมายว่ามีเนื้อหาอ่อนไหว</Notice>
          ) : null}
          <StoryBody
            title={story.title}
            paragraphs={view.paragraphs}
            images={view.bodyImages}
            layout={view.galleryLayout}
            provinceName={view.provinceName}
          />
          {view.source ? (
            <div className="mx-auto max-w-170">
              <SourceLink {...view.source} />
            </div>
          ) : (
            <p className="mx-auto max-w-170 text-sm text-muted-foreground">ไม่มีแหล่งอ้างอิง</p>
          )}
        </article>

        <aside className="order-1 space-y-4 lg:sticky lg:top-24 lg:order-2 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pb-2">
          <Panel title="สถานะ">
            <div className="space-y-4">
              <StatusBadge status={story.status as StoryStatus} />
              {story.status === "REJECTED" && story.rejectReason ? (
                <p className="rounded-xl border border-destructive/25 bg-destructive/6 p-3 text-sm">
                  <span className="block text-xs text-muted-foreground">เหตุผล</span>
                  {story.rejectReason}
                </p>
              ) : null}
              <div className="hidden lg:block">{actions}</div>
            </div>
          </Panel>

          <Panel title="ข้อมูลเรื่อง">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Info label="ยอดอ่าน" value={formatNumber(story.viewCount)} />
              <Info label="รายงานเปิดอยู่" value={<span className={cn(openReports && "font-medium text-destructive")}>{formatNumber(openReports)}</span>} />
              <Info label="สร้างเมื่อ" value={<span title={formatDateTime(story.createdAt)}><RelativeTime value={story.createdAt} /></span>} />
              <Info label="แก้ล่าสุด" value={<RelativeTime value={story.updatedAt} />} />
            </dl>
            <div className="mt-4">
              <MiniMap
                token={mapboxToken}
                latitude={story.latitude}
                longitude={story.longitude}
                categorySlug={story.category.slug}
                provinceName={story.province.name}
              />
            </div>
            {story.status === "APPROVED" ? (
              <a
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full")}
              >
                <ExternalLink aria-hidden="true" />
                เปิดหน้าจริง
              </a>
            ) : null}
          </Panel>

          <Panel title="ผู้เขียน">
            <Link
              href={backofficeHref(`/users/${story.author.id}`)}
              className="-m-2 flex items-center gap-3 rounded-xl p-2 outline-none hover:bg-foreground/4 focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <Avatar id={story.author.id} name={story.author.name} image={story.author.image} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{story.author.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{story.author.email}</span>
              </span>
              <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
            </Link>
            <div className="mt-3 flex items-center justify-between text-sm">
              <UserStatusBadge status={story.author.status} />
              <span className="text-muted-foreground tabular-nums">
                {formatNumber(story.author._count.stories)} เรื่อง
              </span>
            </div>
          </Panel>

          <Panel title={`รายงาน (${formatNumber(story.reports.length)})`}>
            {story.reports.length ? (
              <ul className="space-y-3">
                {story.reports.slice(0, 8).map((report) => (
                  <li key={report.id} className="rounded-xl border border-border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Flag aria-hidden="true" className="size-3.5 text-destructive" />
                        {reportReasonLabel(report.reasonType)}
                      </span>
                      <ReportStatusBadge status={report.status} className="h-6 px-2" />
                    </div>
                    <p className="mt-1.5 line-clamp-3 text-muted-foreground">{report.reason}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {report.reporter?.name ?? "ไม่ระบุตัวตน"} · <RelativeTime value={report.createdAt} />
                    </p>
                  </li>
                ))}
                {story.reports.length > 8 ? (
                  <Link href={backofficeHref("/reports")} className="block text-center text-xs text-muted-foreground hover:text-foreground">
                    ดูทั้งหมดในหน้ารายงาน
                  </Link>
                ) : null}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มีรายงาน</p>
            )}
          </Panel>

          <Panel title="ประวัติการจัดการ">
            <AuditTimeline items={story.history} compact />
          </Panel>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 p-3 backdrop-blur-md lg:hidden">
        {actions}
      </div>

      <ReasonDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialog === "HIDE" ? "ซ่อนเรื่องนี้จากแผนที่?" : "ปฏิเสธเรื่องนี้?"}
        target={story.title}
        description={
          dialog === "HIDE"
            ? "เรื่องจะหายจากแผนที่และหน้าอ่านทันที ผู้เขียนแก้แล้วส่งใหม่ได้"
            : "ผู้เขียนจะเห็นเหตุผลนี้ และแก้ไขแล้วส่งใหม่ได้"
        }
        confirmLabel={dialog === "HIDE" ? "ซ่อนเรื่อง" : "ปฏิเสธ"}
        onConfirm={(reason) => act(dialog ?? "REJECT", reason)}
      />
    </div>
  );
}

function Info({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate tabular-nums">{value}</dd>
    </div>
  );
}

function ActionButtons({
  status,
  pending,
  onApprove,
  onReject,
  onHide,
  onRestore,
  queue,
}: {
  status: string;
  pending: boolean;
  onApprove: () => void;
  onReject: () => void;
  onHide: () => void;
  onRestore: () => void;
  queue: boolean;
}) {
  if (status === "PENDING") {
    return (
      <div className="flex gap-2 lg:flex-col">
        <Tip label={<>อนุมัติ <Kbd>A</Kbd></>}>
          <Button className="h-11 flex-1 rounded-xl lg:w-full lg:flex-none" disabled={pending} onClick={onApprove}>
            <Check aria-hidden="true" />
            อนุมัติและเผยแพร่
          </Button>
        </Tip>
        <Tip label={<>ปฏิเสธ <Kbd>R</Kbd></>}>
          <Button variant="outline" className="h-11 flex-1 rounded-xl text-destructive lg:w-full lg:flex-none" disabled={pending} onClick={onReject}>
            <X aria-hidden="true" />
            ปฏิเสธ
          </Button>
        </Tip>
        {queue ? (
          <p className="hidden text-center text-xs text-muted-foreground lg:block">
            คีย์ลัด <Kbd>A</Kbd> อนุมัติ · <Kbd>R</Kbd> ปฏิเสธ · <Kbd>J</Kbd>/<Kbd>K</Kbd> ถัดไป/ก่อนหน้า
          </p>
        ) : null}
      </div>
    );
  }
  if (status === "APPROVED") {
    return (
      <Button variant="destructive" className="w-full rounded-xl" disabled={pending} onClick={onHide}>
        <EyeOff aria-hidden="true" />
        ซ่อนเรื่อง
      </Button>
    );
  }
  if (status === "REJECTED") {
    return (
      <Button className="w-full rounded-xl" disabled={pending} onClick={onRestore}>
        <RotateCcw aria-hidden="true" />
        กู้คืนและเผยแพร่อีกครั้ง
      </Button>
    );
  }
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Eye aria-hidden="true" className="size-4" />
      ฉบับร่าง — ยังไม่มีการดำเนินการ
    </p>
  );
}

export function StoryReviewSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" aria-busy="true">
      <span className="sr-only">กำลังโหลด…</span>
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-9 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}
