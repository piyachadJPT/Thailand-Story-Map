"use client";

import { AlertTriangle, RotateCcw, SearchX, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { errorMessage } from "./api";

export function ErrorCard({
  error,
  onRetry,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center",
        className
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-destructive/12 text-destructive">
        <AlertTriangle aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </span>
      <div className="space-y-1">
        <p className="font-medium text-foreground">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="text-sm text-muted-foreground">{errorMessage(error)}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw aria-hidden="true" />
          ลองอีกครั้ง
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyBlock({
  icon: Icon,
  title,
  text,
  action,
  tone = "gold",
  className,
}: {
  icon: LucideIcon;
  title: React.ReactNode;
  text?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "gold" | "success";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-12 text-center", className)}>
      <span
        className={cn(
          "grid size-14 place-items-center rounded-full",
          tone === "success" ? "bg-success/12 text-success" : "bg-gold/12 text-gold-ink"
        )}
      >
        <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
      </span>
      <div className="max-w-sm space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {text ? <p className="text-sm text-muted-foreground">{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** "No results for …" — distinct from an empty list. */
export function NoResults({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyBlock
      icon={SearchX}
      title={query ? `ไม่พบผลลัพธ์สำหรับ “${query}”` : "ไม่พบผลลัพธ์ตามตัวกรอง"}
      text="ลองใช้คำอื่น หรือล้างตัวกรอง"
      action={
        onClear ? (
          <Button variant="outline" size="sm" onClick={onClear}>
            ล้างตัวกรอง
          </Button>
        ) : null
      }
    />
  );
}
