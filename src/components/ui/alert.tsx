import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, Info, ShieldAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex items-start gap-3 rounded-2xl border p-4 text-sm text-foreground [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        info: "border-border bg-foreground/4 [&>svg]:text-gold-ink",
        warning: "border-warning/30 bg-warning/10 [&>svg]:text-warning",
        destructive: "border-destructive/30 bg-destructive/10 [&>svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

const icons: Record<NonNullable<VariantProps<typeof alertVariants>["variant"]>, LucideIcon> = {
  info: Info,
  warning: ShieldAlert,
  destructive: CircleAlert,
};

type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    title?: React.ReactNode;
  };

/**
 * Inline message box. Destructive alerts announce themselves (role="alert");
 * pass role explicitly to override.
 */
function Alert({ variant = "info", title, className, children, role, ...props }: AlertProps) {
  const Icon = icons[variant ?? "info"];
  return (
    <div
      data-slot="alert"
      role={role ?? (variant === "destructive" ? "alert" : undefined)}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon aria-hidden="true" />
      <div className="min-w-0 space-y-0.5">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "text-muted-foreground" : undefined}>{children}</div>
      </div>
    </div>
  );
}

export { Alert, alertVariants, type AlertProps };
