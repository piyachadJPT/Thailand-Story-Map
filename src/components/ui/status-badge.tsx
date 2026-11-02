import { cva } from "class-variance-authority";
import type { StoryStatus } from "@/models/enums";
import { cn } from "@/lib/utils";

const statusLabels: Record<StoryStatus, string> = {
  DRAFT: "ฉบับร่าง",
  PENDING: "รอตรวจสอบ",
  APPROVED: "เผยแพร่แล้ว",
  REJECTED: "ไม่ผ่านการตรวจสอบ",
};

const statusBadgeVariants = cva(
  "inline-flex h-7 w-fit shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-medium leading-none whitespace-nowrap",
  {
    variants: {
      status: {
        DRAFT: "border-border bg-muted text-muted-foreground",
        PENDING: "border-warning/30 bg-warning/10 text-warning",
        APPROVED: "border-success/30 bg-success/10 text-success",
        REJECTED: "border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
  }
);

const dotVariants = cva("size-1.5 rounded-full", {
  variants: {
    status: {
      DRAFT: "bg-muted-foreground",
      PENDING: "bg-warning motion-safe:animate-pulse",
      APPROVED: "bg-success",
      REJECTED: "bg-destructive",
    },
  },
});

type StatusBadgeProps = Omit<React.ComponentProps<"span">, "children"> & {
  status: StoryStatus;
};

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      data-status={status.toLowerCase()}
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      <span aria-hidden="true" className={dotVariants({ status })} />
      {statusLabels[status]}
    </span>
  );
}

export { StatusBadge, statusLabels, type StatusBadgeProps };
