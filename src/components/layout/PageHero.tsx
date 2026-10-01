import { cn } from "@/lib/utils";

export default function PageHero({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <header className={cn("mb-10 max-w-2xl", className)}>
      {eyebrow ? (
        <p className="mb-3 text-[0.68rem] font-semibold tracking-[0.22em] text-primary uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}
