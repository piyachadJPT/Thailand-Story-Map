"use client";

import Link from "next/link";
import { backofficeHref } from "@/config/backoffice";
import { auditMeta } from "@/config/auditActions";
import { cn } from "@/lib/utils";
import Avatar from "./Avatar";
import RelativeTime from "./RelativeTime";
import { dayHeading, dayKeyOf, formatTime } from "./format";

export type AuditItem = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  targetLabel: string | null;
  note: string | null;
  createdAt: string;
  admin: { id: string; name: string; username: string | null; image: string | null };
};

export function auditTargetHref(item: Pick<AuditItem, "targetType" | "targetId">) {
  if (item.targetType === "USER") return backofficeHref(`/users/${item.targetId}`);
  if (item.targetType === "ADMIN") return null;
  return backofficeHref(`/stories/${item.targetId}`);
}

const toneClass = {
  success: "text-success bg-success/10",
  destructive: "text-destructive bg-destructive/10",
  warning: "text-warning bg-warning/10",
  neutral: "text-muted-foreground bg-foreground/5",
};

function AuditEntry({ item, showTime, compact }: { item: AuditItem; showTime?: boolean; compact?: boolean }) {
  const meta = auditMeta(item.action);
  const Icon = meta.icon;
  const href = auditTargetHref(item);
  const adminName = item.admin.username ?? item.admin.name;
  return (
    <li className="relative flex gap-3">
      <span className={cn("relative z-10 grid size-8 shrink-0 place-items-center rounded-full ring-4 ring-card", toneClass[meta.tone])}>
        <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm leading-relaxed">
          {compact ? null : (
            <Avatar id={item.admin.id} name={adminName} image={item.admin.image} size="xs" className="mr-1.5 inline-grid align-[-6px]" />
          )}
          <span className="font-medium">{adminName}</span>{" "}
          <span className="text-muted-foreground">{meta.verb}</span>
          {item.targetType !== "ADMIN" ? (
            <>
              {" "}
              {href ? (
                <Link href={href} className="font-medium text-foreground underline-offset-2 hover:underline">
                  {item.targetLabel ?? "(ถูกลบแล้ว)"}
                </Link>
              ) : (
                <span className="font-medium">{item.targetLabel}</span>
              )}
            </>
          ) : null}
        </p>
        {item.note ? (
          <p className="mt-1 rounded-lg bg-foreground/4 px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
            {item.note}
          </p>
        ) : null}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {showTime ? (
            <time dateTime={item.createdAt} className="tabular-nums">
              {formatTime(item.createdAt)} น.
            </time>
          ) : (
            <RelativeTime value={item.createdAt} />
          )}
        </p>
      </div>
    </li>
  );
}

/** Flat list (story / user history). */
export default function AuditTimeline({ items, compact }: { items: AuditItem[]; compact?: boolean }) {
  if (!items.length) return <p className="py-4 text-sm text-muted-foreground">ยังไม่มีประวัติการจัดการ</p>;
  return (
    <ol className="relative space-y-4 before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-px before:bg-border">
      {items.map((item) => (
        <AuditEntry key={item.id} item={item} compact={compact} />
      ))}
    </ol>
  );
}

/** Grouped by Bangkok day: "วันนี้", "เมื่อวาน", dates. */
export function GroupedAuditTimeline({ items }: { items: AuditItem[] }) {
  const groups = new Map<string, AuditItem[]>();
  for (const item of items) {
    const key = dayKeyOf(item.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return (
    <div className="space-y-8">
      {[...groups].map(([day, entries]) => (
        <section key={day} aria-label={dayHeading(day)}>
          <h2 className="sticky top-16 z-10 -mx-1 mb-3 bg-background/90 px-1 py-1 text-sm font-medium text-muted-foreground backdrop-blur-sm">
            {dayHeading(day)}
          </h2>
          <ol className="relative space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft before:absolute before:top-8 before:bottom-8 before:left-[35px] before:w-px before:bg-border sm:p-6 sm:before:left-[39px]">
            {entries.map((item) => (
              <AuditEntry key={item.id} item={item} showTime />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
