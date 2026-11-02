"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CountUp from "./CountUp";
import Sparkline from "./Sparkline";
import { formatCompact } from "../format";

type Tone = "neutral" | "warning" | "destructive";

export default function KpiCard({
  label,
  value,
  icon: Icon,
  href,
  change,
  note,
  spark,
  tone = "neutral",
  sparkColor,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  change?: { percent: number | null; isNew: boolean };
  note?: React.ReactNode;
  spark?: number[];
  tone?: Tone;
  sparkColor?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-[220px] snap-start flex-col gap-3 rounded-2xl border bg-card p-5 shadow-soft outline-none transition-[box-shadow,transform,border-color] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-3 focus-visible:ring-ring/40 motion-reduce:hover:translate-y-0",
        tone === "warning" ? "border-warning/40" : tone === "destructive" ? "border-destructive/40" : "border-border"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-full",
            tone === "warning"
              ? "bg-warning/12 text-warning"
              : tone === "destructive"
                ? "bg-destructive/12 text-destructive"
                : "bg-gold/12 text-gold-ink"
          )}
        >
          <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
        </span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span
          className={cn(
            "font-heading text-[1.85rem] leading-none font-semibold tabular-nums",
            tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "text-foreground"
          )}
        >
          <CountUp value={value} format={formatCompact} />
        </span>
        {change ? <Change {...change} /> : null}
      </div>
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      {spark ? (
        <div className="mt-auto">
          <Sparkline values={spark} color={sparkColor} />
        </div>
      ) : null}
    </Link>
  );
}

function Change({ percent, isNew }: { percent: number | null; isNew: boolean }) {
  if (isNew) {
    return <span className="rounded-full bg-gold/12 px-2 py-0.5 text-xs font-medium text-gold-ink">ใหม่</span>;
  }
  if (percent === null) return <span className="text-xs text-muted-foreground">—</span>;
  const up = percent >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-xs font-medium tabular-nums", up ? "text-success" : "text-destructive")}
      aria-label={`${up ? "เพิ่มขึ้น" : "ลดลง"} ${Math.abs(percent)}% จากช่วงก่อนหน้า`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {Math.abs(percent).toLocaleString("th-TH")}%
    </span>
  );
}
