import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const emptyStateVariants = cva("flex flex-col items-center gap-4 text-center", {
  variants: {
    /** framed: dashed box inside a page; page: full-page message (404, errors). */
    layout: {
      framed: "rounded-lg border border-dashed border-border px-6 py-12",
      page: "px-2 py-6",
    },
  },
  defaultVariants: { layout: "framed" },
});

type EmptyStateProps = Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof emptyStateVariants> & {
    icon?: LucideIcon;
    /** Larger artwork shown instead of the icon. */
    illustration?: React.ReactNode;
    title: React.ReactNode;
    text?: React.ReactNode;
    /** Usually a <Button> or a link styled with buttonVariants. */
    action?: React.ReactNode;
    /** Heading level for the title, to fit the page outline. */
    headingLevel?: "h1" | "h2" | "h3";
  };

function EmptyState({
  icon: Icon,
  illustration,
  title,
  text,
  action,
  layout,
  headingLevel: Heading = "h3",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div data-slot="empty-state" className={cn(emptyStateVariants({ layout }), className)} {...props}>
      {illustration ??
        (Icon ? (
          <Icon aria-hidden="true" strokeWidth={1.5} className="size-9 text-gold-ink" />
        ) : null)}
      <div className="max-w-md space-y-1.5">
        <Heading
          className={cn(
            "font-heading font-bold text-foreground",
            layout === "page" ? "text-3xl sm:text-4xl" : "text-lg"
          )}
        >
          {title}
        </Heading>
        {text ? <p className="text-sm text-muted-foreground">{text}</p> : null}
      </div>
      {action ? <div className="mt-1 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
