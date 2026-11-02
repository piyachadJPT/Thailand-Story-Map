"use client";

import { formatDateTime, formatRelative } from "./format";
import { cn } from "@/lib/utils";

/** "3 ชม. ที่แล้ว" with the full date/time as a tooltip. */
export default function RelativeTime({ value, className }: { value: string | Date; className?: string }) {
  const date = new Date(value);
  return (
    <time
      dateTime={date.toISOString()}
      title={formatDateTime(date)}
      className={cn("tabular-nums", className)}
      suppressHydrationWarning
    >
      {formatRelative(date)}
    </time>
  );
}
