"use client";

import Link from "next/link";
import { backofficeHref } from "@/config/backoffice";
import { auditMeta } from "@/config/auditActions";
import { cn } from "@/lib/utils";
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
  success: "text-success bg-success/12",
  destructive: "text-destructive bg-destructive/12",
  warning: "text-warning bg-warning/12",
  neutral: "text-muted-foreground bg-muted",
};

function AuditEntry({ item, showTime }: { item: AuditItem; showTime?: boolean }) {
  const meta = auditMeta(item.action);
  const Icon = meta.icon;
  const href = auditTargetHref(item);
  const adminName = item.admin.username ?? item.admin.name;
  return (
    <li className={cn("group/entry grid gap-x-3", showTime ? "grid-cols-[2.75rem_2rem_1fr]" : "grid-cols-[2rem_1fr]")}>
      {showTime ? (
        <time dateTime={item.createdAt} className="pt-1.5 text-right text-xs text-muted-foreground tabular-nums">
          {formatTime(item.createdAt)}
        </time>
      ) : null}
      {/* Icon plus the connector down to the next entry. */}
      <span className="relative flex justify-center">
        <span className={cn("relative z-10 grid size-8 place-items-center rounded-full", toneClass[meta.tone])}>
          <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
        </span>
        <span aria-hidden="true" className="absolute top-9 -bottom-4 w-px bg-border group-last/entry:hidden" />
      </span>
      <div className="min-w-0 pt-1 pb-4 group-last/entry:pb-0">
        <p className="text-sm leading-relaxed">
          <span className="font-medium">{adminName}</span> <span className="text-muted-foreground">{meta.verb}</span>
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
        {item.note ? <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">“{item.note}”</p> : null}
        {showTime ? null : <RelativeTime value={item.createdAt} className="mt-0.5 block text-xs text-muted-foreground" />}
      </div>
    </li>
  );
}

/** Flat list (story / user history). */
export default function AuditTimeline({ items }: { items: AuditItem[]; compact?: boolean }) {
  if (!items.length) return <p className="py-4 text-sm text-muted-foreground">ยังไม่มีประวัติการจัดการ</p>;
  return (
    <ol>
      {items.map((item) => (
        <AuditEntry key={item.id} item={item} />
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
          <h2 className="mb-3 text-sm font-medium text-foreground">
            {dayHeading(day)}
          </h2>
          <ol className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            {entries.map((item) => (
              <AuditEntry key={item.id} item={item} showTime />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
