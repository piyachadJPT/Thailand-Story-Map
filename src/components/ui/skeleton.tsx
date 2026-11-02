import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "rounded-xl bg-foreground/6 motion-safe:animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
