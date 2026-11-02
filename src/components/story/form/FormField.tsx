import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: React.ReactNode;
  /** id of the control the label points at. Omit for groups (renders a span). */
  htmlFor?: string;
  /** id for the label itself (for aria-labelledby on non-input controls). */
  labelId?: string;
  hint?: React.ReactNode;
  hintId?: string;
  className?: string;
  children: React.ReactNode;
};

/** Label + control + optional hint, with consistent spacing. */
export default function FormField({
  label,
  htmlFor,
  labelId,
  hint,
  hintId,
  className,
  children,
}: FormFieldProps) {
  const labelClass = "mb-2 block text-sm font-medium text-foreground";
  return (
    <div className={cn("min-w-0", className)}>
      {htmlFor ? (
        <label id={labelId} htmlFor={htmlFor} className={labelClass}>
          {label}
        </label>
      ) : (
        <span id={labelId} className={labelClass}>{label}</span>
      )}
      {children}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
