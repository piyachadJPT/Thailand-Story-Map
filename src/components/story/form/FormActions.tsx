import { cn } from "@/lib/utils";

type FormActionsProps = {
  error?: string;
  notice?: string;
  /** Sticks to the bottom of a scrolling panel (composer). */
  sticky?: boolean;
  className?: string;
  /** Buttons: secondary action first, primary last. */
  children: React.ReactNode;
};

/** Form footer: error/notice messages above the action buttons. */
export default function FormActions({
  error,
  notice,
  sticky = false,
  className,
  children,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "space-y-3 border-t border-border pt-4",
        sticky &&
          "sticky bottom-0 bg-card px-5 pb-[max(1rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-sm text-success">
          {notice}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {children}
      </div>
    </div>
  );
}
