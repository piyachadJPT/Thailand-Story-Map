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
  "inline-flex h-7 w-fit shrink-0 items-center gap-2 rounded-control border px-3 text-xs font-medium leading-none whitespace-nowrap",
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

/* ── Users and reports use the same pill shape ── */

const userStatusLabels = { ACTIVE: "ใช้งานปกติ", BANNED: "ถูกระงับ", ADMIN: "แอดมิน" } as const;
const reportStatusLabels = { OPEN: "เปิดอยู่", RESOLVED: "จัดการแล้ว" } as const;

const toneBadge = cva(
  "inline-flex h-7 w-fit shrink-0 items-center gap-2 rounded-control border px-3 text-xs font-medium leading-none whitespace-nowrap",
  {
    variants: {
      tone: {
        success: "border-success/30 bg-success/10 text-success",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        warning: "border-warning/30 bg-warning/10 text-warning",
        gold: "border-gold/40 bg-gold/12 text-gold-ink",
        muted: "border-border bg-muted text-muted-foreground",
      },
    },
  }
);
const toneDot = cva("size-1.5 rounded-full", {
  variants: {
    tone: {
      success: "bg-success",
      destructive: "bg-destructive",
      warning: "bg-warning",
      gold: "bg-gold",
      muted: "bg-muted-foreground",
    },
  },
});

type Tone = "success" | "destructive" | "warning" | "gold" | "muted";

function TonePill({ tone, label, className }: { tone: Tone; label: string; className?: string }) {
  return (
    <span data-slot="status-badge" className={cn(toneBadge({ tone }), className)}>
      <span aria-hidden="true" className={toneDot({ tone })} />
      {label}
    </span>
  );
}

/** ACTIVE / BANNED, or ADMIN for admin accounts. */
function UserStatusBadge({
  status,
  admin,
  className,
}: {
  status: "ACTIVE" | "BANNED" | string;
  admin?: boolean;
  className?: string;
}) {
  if (status === "BANNED") return <TonePill tone="destructive" label={userStatusLabels.BANNED} className={className} />;
  if (admin) return <TonePill tone="gold" label={userStatusLabels.ADMIN} className={className} />;
  return <TonePill tone="success" label={userStatusLabels.ACTIVE} className={className} />;
}

function ReportStatusBadge({ status, className }: { status: "OPEN" | "RESOLVED" | string; className?: string }) {
  return status === "OPEN" ? (
    <TonePill tone="destructive" label={reportStatusLabels.OPEN} className={className} />
  ) : (
    <TonePill tone="muted" label={reportStatusLabels.RESOLVED} className={className} />
  );
}

export { UserStatusBadge, ReportStatusBadge, TonePill };
