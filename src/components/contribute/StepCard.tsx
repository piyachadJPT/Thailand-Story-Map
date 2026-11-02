import type { LucideIcon } from "lucide-react";

type StepCardProps = {
  step: number;
  icon: LucideIcon;
  title: string;
  body: string;
};

/** One step of "how to contribute": number, icon, title, short text. */
export default function StepCard({ step, icon: Icon, title, body }: StepCardProps) {
  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="grid size-12 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold-ink">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <span aria-hidden="true" className="font-heading text-4xl font-semibold text-gold/40 tabular-nums">
          {String(step).padStart(2, "0")}
        </span>
      </div>
      <p className="mt-6 text-xs font-medium tracking-widest text-gold-ink">ขั้นตอนที่ {step}</p>
      <h2 className="mt-1 font-heading text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </article>
  );
}
