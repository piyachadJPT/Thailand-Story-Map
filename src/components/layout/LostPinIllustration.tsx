import { Compass, MapPinOff, TriangleAlert } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toneVariants = cva("", {
  variants: {
    tone: {
      lost: "text-gold-ink [--trail:var(--gold)]",
      error: "text-destructive [--trail:var(--destructive)]",
    },
  },
  defaultVariants: { tone: "lost" },
});

type LostPinIllustrationProps = VariantProps<typeof toneVariants> & {
  /** Small label on the ring, e.g. "404". */
  label?: string;
  className?: string;
};

/**
 * A pin that wandered off its dashed trail, next to a compass.
 * Inline SVG for the trail; lucide icons for the pin and compass.
 */
export default function LostPinIllustration({ tone, label, className }: LostPinIllustrationProps) {
  const Pin = tone === "error" ? TriangleAlert : MapPinOff;
  return (
    <div aria-hidden="true" className={cn("relative size-56", toneVariants({ tone }), className)}>
      <svg viewBox="0 0 224 224" fill="none" className="absolute inset-0 size-full">
        <circle cx="112" cy="112" r="96" className="stroke-border" strokeWidth="1.5" />
        <circle cx="112" cy="112" r="70" className="stroke-(--trail)/25" strokeWidth="1" />
        <path
          d="M30 170 C 60 120, 70 190, 110 150 S 150 90, 120 70 S 180 40, 196 70"
          className="stroke-(--trail)"
          strokeWidth="2"
          strokeDasharray="2 8"
          strokeLinecap="round"
        />
        <circle cx="30" cy="170" r="5" className="fill-(--trail)" />
        <path d="M188 62 l16 16 M204 62 l-16 16" className="stroke-(--trail)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="absolute top-1/2 left-1/2 grid size-20 -translate-1/2 place-items-center rounded-full border border-current/40 bg-card motion-safe:animate-float">
        <Pin className="size-9" />
      </span>
      <span className="absolute right-4 bottom-6 grid size-11 place-items-center rounded-full border border-border bg-card text-muted-foreground">
        <Compass className="size-5 motion-safe:animate-spin-slow" />
      </span>
      {label ? (
        <span className="absolute top-6 left-4 rounded-full border border-current/40 bg-card px-2.5 py-0.5 font-heading text-xs font-semibold tabular-nums">
          {label}
        </span>
      ) : null}
    </div>
  );
}
