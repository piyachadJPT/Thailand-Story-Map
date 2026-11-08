import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  /** Subtitle under the title. */
  description?: string;
  /** Optional buttons or links shown under the subtitle. */
  actions?: React.ReactNode;
  align?: "start" | "center";
  className?: string;
};

/** Page opener: vermilion eyebrow, large serif title, subtitle, actions. */
export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
  align = "start",
  className,
}: PageHeroProps) {
  return (
    <header
      className={cn(
        "mb-10 flex max-w-3xl flex-col gap-6 sm:mb-14",
        align === "center" && "mx-auto items-center",
        className
      )}
    >
      <SectionHeading
        as="h1"
        size="lg"
        align={align}
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="gap-4"
      />
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </header>
  );
}
