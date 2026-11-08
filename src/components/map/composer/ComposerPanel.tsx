"use client";

import { createPortal } from "react-dom";
import { GoldDivider } from "@/components/ui/gold-divider";
import { cn } from "@/lib/utils";
import ComposerProgress, { type ComposerStep } from "./ComposerProgress";

type ComposerPanelProps = {
  /** Hidden (not unmounted) while picking a point, so typed text survives. */
  hidden: boolean;
  step: ComposerStep;
  onStepChange: (step: ComposerStep) => void;
  children: React.ReactNode;
};

/**
 * Right-side panel on sm+, full-screen sheet on phones. Rendered into <body>
 * so the phone sheet can cover the navbar.
 */
export default function ComposerPanel({ hidden, step, onStepChange, children }: ComposerPanelProps) {
  return createPortal(
    <section
      id="story-composer"
      aria-label="เขียนเรื่องราว"
      tabIndex={-1}
      hidden={hidden}
      className={cn(
        "fixed inset-0 z-70 flex flex-col overflow-hidden bg-card/95 outline-none text-card-foreground backdrop-blur-xl",
        "sm:inset-auto sm:top-24 sm:right-4 sm:bottom-4 sm:w-[min(32rem,calc(100vw-2rem))] sm:rounded-panel sm:border sm:border-border",
        "motion-safe:animate-slide-up"
      )}
    >
      <header className="shrink-0 space-y-4 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-medium tracking-widest text-gold-ink">
            <span aria-hidden="true" className="h-px w-5 bg-gold" />
            ปักหมุดเรื่องราว
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-foreground">เขียนเรื่องราว</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            เล่าเรื่องของคุณ แล้วปักหมุดให้คนอื่นค้นพบ
          </p>
        </div>
        <ComposerProgress step={step} onStepChange={onStepChange} />
      </header>
      <GoldDivider strength="subtle" />
      {children}
    </section>,
    document.body
  );
}
