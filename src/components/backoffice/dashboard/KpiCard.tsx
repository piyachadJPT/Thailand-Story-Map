"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CountUp from "./CountUp";
import Sparkline from "./Sparkline";
import { formatCompact } from "../format";

type Tone = "neutral" | "warning" | "destructive";

/** One KPI tile inside the dashboard's KPI strip (cells share borders). */
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
  const hasTrend = spark?.some((point) => point > 0);
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-w-[190px] snap-start flex-col gap-2 bg-card p-5 outline-none transition-colors duration-150",
        "hover:bg-muted focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset sm:min-w-0"
      )}
    >
      <span className="flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
        <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
        <span className="truncate">{label}</span>
        {tone !== "neutral" ? (
          <span
            aria-hidden="true"
            className={cn("ml-auto size-2 shrink-0 rounded-full", tone === "warning" ? "bg-warning" : "bg-destructive")}
          />
        ) : null}
      </span>
      <span className="flex items-baseline gap-2.5">
        <span
          className={cn(
            "font-heading text-[1.875rem] leading-tight font-semibold tracking-tight tabular-nums",
            tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "text-foreground"
          )}
        >
          <CountUp value={value} format={formatCompact} />
        </span>
        {change ? <Change {...change} /> : null}
      </span>
      {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
      <span className="mt-auto block h-7 pt-1">
        {hasTrend && spark ? <Sparkline values={spark} color={sparkColor} /> : null}
      </span>
    </Link>
  );
}

function Change({ percent, isNew }: { percent: number | null; isNew: boolean }) {
  if (isNew) return <span className="text-xs font-medium text-gold-ink">ใหม่</span>;
  if (percent === null) return null;
  const up = percent >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn("inline-flex items-center text-xs font-medium tabular-nums", up ? "text-success" : "text-destructive")}
      aria-label={`${up ? "เพิ่มขึ้น" : "ลดลง"} ${Math.abs(percent)}% จากช่วงก่อนหน้า`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {Math.abs(percent).toLocaleString("th-TH")}%
    </span>
  );
}
