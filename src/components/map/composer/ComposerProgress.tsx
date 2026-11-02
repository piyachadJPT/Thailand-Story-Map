import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const COMPOSER_STEPS = ["ประเภท & ตำแหน่ง", "เนื้อหา", "ตรวจทาน"] as const;
export type ComposerStep = 0 | 1 | 2;

type ComposerProgressProps = {
  step: ComposerStep;
  onStepChange: (step: ComposerStep) => void;
};

/** 3-step indicator; each step is a button so people can jump back and forth. */
export default function ComposerProgress({ step, onStepChange }: ComposerProgressProps) {
  return (
    <ol className="flex items-center gap-2">
      {COMPOSER_STEPS.map((label, index) => {
        const done = index < step;
        const current = index === step;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              aria-current={current ? "step" : undefined}
              onClick={() => onStepChange(index as ComposerStep)}
              className="group flex min-w-0 items-center gap-2 rounded-full py-1 pr-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                  current && "border-primary bg-primary text-primary-foreground ring-2 ring-gold/50 ring-offset-2 ring-offset-card",
                  done && "border-gold bg-gold/15 text-gold-ink",
                  !current && !done && "border-border text-muted-foreground"
                )}
              >
                {done ? <Check aria-hidden="true" className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "truncate text-xs",
                  current ? "font-semibold text-foreground" : "hidden text-muted-foreground sm:inline"
                )}
              >
                {label}
              </span>
            </button>
            {index < COMPOSER_STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn("h-px min-w-3 flex-1", done ? "bg-gold" : "bg-border")}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
