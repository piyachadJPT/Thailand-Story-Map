"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { errorMessage } from "./api";

export const STORY_REASON_PRESETS = [
  "ข้อมูลไม่มีแหล่งอ้างอิง",
  "เนื้อหาซ้ำ",
  "ละเมิดความเป็นส่วนตัว",
  "ภาษาไม่เหมาะสม",
];
export const BAN_REASON_PRESETS = ["สแปม", "เนื้อหาเท็จซ้ำ ๆ", "ละเมิดผู้อื่น", "บัญชีปลอม"];

const MIN = 3;
const MAX = 500;

/**
 * Confirmation for actions that are hard to undo. Names the target, asks for
 * a reason (required unless `optional`), and offers one-tap preset reasons.
 */
export default function ReasonDialog({
  open,
  onOpenChange,
  title,
  target,
  description,
  confirmLabel,
  tone = "destructive",
  presets = STORY_REASON_PRESETS,
  optional = false,
  reasonLabel = "เหตุผล",
  extra,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  target?: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel: string;
  tone?: "destructive" | "primary";
  presets?: string[];
  optional?: boolean;
  reasonLabel?: string;
  /** Extra controls (e.g. a checkbox) shown above the buttons. */
  extra?: React.ReactNode;
  onConfirm: (reason: string) => Promise<unknown>;
}) {
  const id = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const trimmed = reason.trim();
  const invalid = !optional && trimmed.length < MIN;

  function close(next: boolean) {
    if (pending) return;
    onOpenChange(next);
    if (!next) {
      setReason("");
      setError(null);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (invalid) {
      setError(`กรุณาระบุ${reasonLabel}อย่างน้อย ${MIN} ตัวอักษร`);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onConfirm(trimmed);
      onOpenChange(false);
      setReason("");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="gap-5 rounded-2xl p-5 sm:max-w-md sm:p-6">
        <form onSubmit={submit} className="grid gap-5" noValidate>
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg leading-snug font-semibold">{title}</DialogTitle>
            {target ? (
              <div className="rounded-xl border border-border bg-foreground/3 px-3 py-2 text-sm font-medium text-foreground">
                {target}
              </div>
            ) : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>

          <div className="grid gap-2">
            <div className="flex items-baseline justify-between">
              <label htmlFor={`${id}-reason`} className="text-sm font-medium">
                {reasonLabel}
                {optional ? <span className="font-normal text-muted-foreground"> (ไม่บังคับ)</span> : null}
              </label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  trimmed.length > MAX ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {trimmed.length}/{MAX}
              </span>
            </div>
            {presets.length ? (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="เหตุผลสำเร็จรูป">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setReason(preset);
                      setError(null);
                    }}
                    aria-pressed={reason === preset}
                    className="h-8 rounded-full border border-border px-3 text-xs transition-colors duration-150 outline-none hover:border-gold/60 focus-visible:ring-3 focus-visible:ring-ring/40 aria-pressed:border-gold aria-pressed:bg-gold/12"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            ) : null}
            <Textarea
              id={`${id}-reason`}
              value={reason}
              maxLength={MAX}
              rows={3}
              autoFocus
              onChange={(event) => {
                setReason(event.target.value);
                setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className="min-h-24 rounded-xl"
            />
            {error ? (
              <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          {extra}

          <DialogFooter className="-mx-5 -mb-5 rounded-b-2xl sm:-mx-6 sm:-mb-6">
            <Button type="button" variant="ghost" onClick={() => close(false)} disabled={pending}>
              ยกเลิก
            </Button>
            <Button type="submit" variant={tone === "destructive" ? "destructive" : "primary"} disabled={pending}>
              {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
