"use client";

import { useId, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { reportReasons } from "@/config/reportReasons";
import type { ReportReason } from "@/models/enums";
import {
  REPORT_DETAILS_MAX,
  REPORT_DETAILS_MIN,
  REPORT_DETAILS_MIN_OTHER,
} from "@/models/schemas/report";
import { cn } from "@/lib/utils";
import { responseErrorMessage } from "@/utils/errorHandler";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyId: string;
  title: string;
  onReported: () => void;
};

/** Report form. Bottom sheet on phones, centered dialog from `sm`. */
export default function ReportDialog({ open, onOpenChange, storyId, title, onReported }: Props) {
  const id = useId();
  const [reasonType, setReasonType] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<{ field?: "reason" | "details"; message: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const minLength = reasonType === "OTHER" ? REPORT_DETAILS_MIN_OTHER : REPORT_DETAILS_MIN;
  const length = details.trim().length;

  function reset(next: boolean) {
    onOpenChange(next);
    if (!next && done) {
      setReasonType(null);
      setDetails("");
      setDone(false);
    }
    if (!next) setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!reasonType) return setError({ field: "reason", message: "กรุณาเลือกประเภทการรายงาน" });
    if (length < minLength)
      return setError({ field: "details", message: `กรุณาอธิบายอย่างน้อย ${minLength} ตัวอักษร` });
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, reasonType, details: details.trim() }),
      });
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        if (response.status === 409) onReported();
        setError({ message: responseErrorMessage(response, body, "ส่งรายงานไม่สำเร็จ กรุณาลองใหม่") });
        return;
      }
      setDone(true);
      onReported();
      window.setTimeout(() => reset(false), 1800);
    } catch {
      setError({ message: "เชื่อมต่อไม่ได้ กรุณาลองใหม่" });
    } finally {
      setSending(false);
    }
  }

  const detailsError = error?.field === "details" ? error.message : null;
  const reasonError = error?.field === "reason" ? error.message : null;

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent
        className={cn(
          "max-h-[92dvh] gap-5 overflow-y-auto p-5 sm:max-w-lg sm:p-6",
          "max-sm:top-auto max-sm:bottom-0 max-sm:max-w-none max-sm:translate-y-0 max-sm:rounded-t-3xl max-sm:rounded-b-none",
          "max-sm:data-open:slide-in-from-bottom-8 max-sm:data-open:zoom-in-100"
        )}
      >
        {done ? (
          <div role="status" className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success/12 text-success">
              <CheckCircle2 aria-hidden="true" className="size-7" />
            </span>
            <DialogTitle className="text-lg font-semibold">ขอบคุณที่ช่วยดูแลชุมชน</DialogTitle>
            <DialogDescription>ทีมงานได้รับรายงานแล้ว และจะตรวจสอบโดยเร็ว</DialogDescription>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-5">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-lg leading-snug font-semibold">รายงานเรื่องนี้</DialogTitle>
              <DialogDescription className="line-clamp-2">“{title}”</DialogDescription>
            </DialogHeader>

            <fieldset aria-describedby={reasonError ? `${id}-reason-error` : undefined}>
              <legend className="mb-2 text-sm font-medium text-foreground">ปัญหาที่พบ</legend>
              <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
                {reportReasons.map((reason) => {
                  const Icon = reason.icon;
                  const checked = reasonType === reason.value;
                  return (
                    <label
                      key={reason.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-3 transition-colors duration-150",
                        "hover:border-gold/60 has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
                        checked && "border-gold bg-gold/10"
                      )}
                    >
                      <input
                        type="radio"
                        name={`${id}-reason`}
                        value={reason.value}
                        checked={checked}
                        onChange={() => {
                          setReasonType(reason.value);
                          if (error?.field === "reason") setError(null);
                        }}
                        className="sr-only"
                      />
                      <Icon
                        aria-hidden="true"
                        strokeWidth={1.75}
                        className={cn("mt-0.5 size-5 shrink-0", checked ? "text-gold-ink" : "text-muted-foreground")}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">{reason.label}</span>
                        <span className="block text-xs leading-relaxed text-muted-foreground">{reason.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {reasonError ? (
                <p id={`${id}-reason-error`} role="alert" className="mt-2 text-sm text-destructive">
                  {reasonError}
                </p>
              ) : null}
            </fieldset>

            <div className="grid gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={`${id}-details`} className="text-sm font-medium text-foreground">
                  รายละเอียด
                </label>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    length > 0 && length < minLength ? "text-warning" : "text-muted-foreground"
                  )}
                  aria-live="polite"
                >
                  {length.toLocaleString("th-TH")} / {REPORT_DETAILS_MAX.toLocaleString("th-TH")}
                </span>
              </div>
              <Textarea
                id={`${id}-details`}
                value={details}
                maxLength={REPORT_DETAILS_MAX}
                rows={4}
                onChange={(event) => {
                  setDetails(event.target.value);
                  if (error?.field === "details") setError(null);
                }}
                aria-invalid={detailsError ? true : undefined}
                aria-describedby={`${id}-details-hint${detailsError ? ` ${id}-details-error` : ""}`}
                placeholder="เล่าสั้น ๆ ว่าส่วนไหนผิด หรือไม่เหมาะสมอย่างไร"
                className="min-h-28 rounded-2xl px-3.5 py-3"
              />
              <p id={`${id}-details-hint`} className="text-xs text-muted-foreground">
                อย่างน้อย {minLength} ตัวอักษร
              </p>
              {detailsError ? (
                <p id={`${id}-details-error`} role="alert" className="text-sm text-destructive">
                  {detailsError}
                </p>
              ) : null}
            </div>

            <p className="flex items-start gap-2 rounded-2xl bg-foreground/4 p-3 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-ink" />
              ทีมงานจะตรวจสอบโดยเร็ว และจะไม่เปิดเผยตัวตนผู้รายงาน
            </p>

            {error && !error.field ? (
              <p role="alert" className="text-sm text-destructive">
                {error.message}
              </p>
            ) : null}

            <DialogFooter className="-mx-5 -mb-5 sm:-mx-6 sm:-mb-6">
              <Button type="button" variant="ghost" onClick={() => reset(false)} disabled={sending}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
                {sending ? "กำลังส่ง…" : "ส่งรายงาน"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
