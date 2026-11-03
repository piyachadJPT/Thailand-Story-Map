import { cn } from "@/lib/utils";

/** "12 ตัวอักษร · แนะนำ 20–60 …" — advice only; validation is unchanged. */
export default function LengthHint({
  id,
  length,
  min,
  max,
  children,
}: {
  id: string;
  length: number;
  min: number;
  max: number;
  children: React.ReactNode;
}) {
  const inRange = length >= min && length <= max;
  return (
    <span id={id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <span>{children}</span>
      <span aria-live="polite" className={cn("tabular-nums", length > 0 && inRange && "text-gold-ink")}>
        {length.toLocaleString("th-TH")} ตัวอักษร
      </span>
    </span>
  );
}
