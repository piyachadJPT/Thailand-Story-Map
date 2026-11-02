"use client";

import { createElement } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, Eye, FilePlus2, Flag, Siren, UserPlus } from "lucide-react";
import CategoryChip from "@/components/story/CategoryChip";
import { buttonVariants } from "@/components/ui/button";
import { backofficeHref } from "@/config/backoffice";
import { categoryColor, categoryIcon } from "@/config/categories";
import { auditMeta } from "@/config/auditActions";
import { reportReasonLabel } from "@/config/reportReasons";
import { cn } from "@/lib/utils";
import { Panel } from "../PageHeader";
import RelativeTime from "../RelativeTime";
import { formatCompact, formatDuration, formatNumber } from "../format";
import type { Overview } from "./types";

export function NeedsAttention({ data }: { data: Overview["needsAttention"] }) {
  const empty = !data.stalePending.length && !data.heavilyReported.length;
  // Nothing to act on: the KPI strip already shows 0 pending / 0 reports.
  if (empty) return null;
  return (
    <section
      aria-labelledby="needs-attention"
      className="rounded-2xl border border-warning/40 bg-card p-5 sm:p-6"
    >
      <h2 id="needs-attention" className="flex items-center gap-2 text-sm font-medium text-warning">
        <AlertTriangle aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
        ต้องจัดการ
      </h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {data.stalePending.length ? (
          <AttentionList title="รอตรวจนานเกิน 24 ชม." icon={Clock}>
            {data.stalePending.map((story) => (
              <AttentionItem
                key={story.id}
                href={backofficeHref(`/stories/${story.id}?queue=1`)}
                title={story.title}
                meta={`${story.authorName} · รอ ${formatDuration(story.waitingHours)}`}
              />
            ))}
          </AttentionList>
        ) : null}
        {data.heavilyReported.length ? (
          <AttentionList title="ถูกรายงานตั้งแต่ 3 ครั้งขึ้นไป" icon={Siren}>
            {data.heavilyReported.map((story) => (
              <AttentionItem
                key={story.id}
                href={backofficeHref(`/stories/${story.id}`)}
                title={story.title}
                meta={`รายงานเปิดอยู่ ${formatNumber(story.openReports)} รายการ`}
                danger
              />
            ))}
          </AttentionList>
        ) : null}
      </div>
    </section>
  );
}

function AttentionList({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Clock;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
        {title}
      </h3>
      <ul className="divide-y divide-border">{children}</ul>
    </div>
  );
}

function AttentionItem({ href, title, meta, danger }: { href: string; title: string; meta: string; danger?: boolean }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className={cn("text-xs tabular-nums", danger ? "text-destructive" : "text-muted-foreground")}>{meta}</p>
      </div>
      <Link href={href} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0")}>
        ตรวจเลย
      </Link>
    </li>
  );
}

export function TopStories({ stories }: { stories: Overview["topStories"] }) {
  return (
    <Panel title="เรื่องยอดนิยม" description="5 อันดับตามยอดอ่าน">
      {stories.length ? (
        <ol className="divide-y divide-border">
          {stories.map((story, index) => (
            <li key={story.id}>
              <Link
                href={backofficeHref(`/stories/${story.id}`)}
                className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 outline-none transition-colors hover:bg-foreground/4 focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <span className="w-5 text-center text-sm font-semibold text-gold-ink tabular-nums">{index + 1}</span>
                <Cover url={story.coverUrl} categorySlug={story.categorySlug} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{story.title}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <CategoryChip slug={story.categorySlug} className="h-6" />
                    <span className="truncate text-xs text-muted-foreground">{story.provinceName}</span>
                  </span>
                </span>
                <span className="flex items-center gap-1 text-sm tabular-nums">
                  <Eye aria-hidden="true" className="size-4 text-muted-foreground" strokeWidth={1.75} />
                  <span className="sr-only">ยอดอ่าน</span>
                  {formatCompact(story.viewCount)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีเรื่องที่เผยแพร่</p>
      )}
    </Panel>
  );
}

export function Cover({
  url,
  categorySlug,
  className,
}: {
  url: string | null;
  categorySlug?: string;
  className?: string;
}) {
  if (url) {
    return (
      // Covers live on external storage.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" loading="lazy" className={cn("size-12 shrink-0 rounded-xl object-cover ring-1 ring-border", className)} />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ "--cover": categoryColor(categorySlug ?? "") } as React.CSSProperties}
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-xl bg-(--cover)/10 text-(--cover) ring-1 ring-(--cover)/20",
        className
      )}
    >
      {createElement(categoryIcon(categorySlug ?? ""), { className: "size-5", strokeWidth: 1.75 })}
    </span>
  );
}

const activityIcon = { story: FilePlus2, report: Flag, user: UserPlus } as const;

export function ActivityFeed({ items }: { items: Overview["activity"] }) {
  return (
    <Panel
      title="กิจกรรมล่าสุด"
      action={
        <Link
          href={backofficeHref("/audit")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          ดูทั้งหมด
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      }
    >
      {items.length ? (
        <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-border">
          {items.map((item) => {
            const meta = item.kind === "audit" ? auditMeta(item.action ?? "") : null;
            const Icon = meta?.icon ?? activityIcon[item.kind as keyof typeof activityIcon];
            const href =
              item.href?.type === "user"
                ? backofficeHref(`/users/${item.href.id}`)
                : item.href?.type === "story"
                  ? backofficeHref(`/stories/${item.href.id}`)
                  : backofficeHref("/audit");
            const sentence =
              item.kind === "story"
                ? `${item.detail} ส่งเรื่องใหม่`
                : item.kind === "report"
                  ? `รายงานใหม่ (${reportReasonLabel(item.detail ?? "")})`
                  : item.kind === "user"
                    ? "ผู้ใช้ใหม่สมัครสมาชิก"
                    : `${item.detail} ${meta?.verb ?? ""}`;
            return (
              <li key={item.id} className="relative flex gap-3">
                <span
                  className={cn(
                    "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card",
                    item.kind === "report" ? "text-destructive" : meta?.tone === "destructive" ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm text-muted-foreground">
                    {sentence}{" "}
                    {item.title ? (
                      <Link href={href} className="font-medium text-foreground hover:underline">
                        {item.title}
                      </Link>
                    ) : null}
                  </p>
                  <RelativeTime value={item.at} className="text-xs text-muted-foreground" />
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีกิจกรรม</p>
      )}
    </Panel>
  );
}
