import type { LucideIcon } from "lucide-react";
import { thaiOrdinal } from "@/lib/thai-digits";

type StepCardProps = {
  step: number;
  icon: LucideIcon;
  title: string;
  body: string;
};

/** One step of "how to contribute": number, icon, title, short text. */
export default function StepCard({ step, icon: Icon, title, body }: StepCardProps) {
  return (
    <article className="relative flex h-full flex-col rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <Icon aria-hidden="true" strokeWidth={1.5} className="size-7 text-gold-ink" />
        <span aria-hidden="true" className="font-heading text-4xl font-bold text-gold/50 tabular-nums">
          {thaiOrdinal(step)}
        </span>
      </div>
      <p className="mt-6 text-sm font-semibold text-chad">ขั้นตอนที่ {step}</p>
      <h2 className="mt-1 font-heading text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </article>
  );
}
