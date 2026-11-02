import { cn } from "@/lib/utils";

/** Title, one-line description, primary action on the right, filters below. */
export default function PageHeader({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
            {title}
          </h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}

/** Rounded card used throughout the backoffice (solid, never glass). */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  as: Comp = "section",
  ...props
}: Omit<React.HTMLAttributes<HTMLElement>, "title"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  bodyClassName?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Comp
      className={cn("rounded-2xl border border-border bg-card text-card-foreground shadow-soft", className)}
      {...props}
    >
      {title || action ? (
        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            {title ? <h2 className="text-sm font-medium text-muted-foreground">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={cn("p-5 sm:p-6", (title || action) && "pt-4 sm:pt-4", bodyClassName)}>{children}</div>
    </Comp>
  );
}
