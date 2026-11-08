import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const goldDividerVariants = cva("shrink-0", {
  variants: {
    orientation: {
      horizontal: "w-full",
      vertical: "h-5 w-px",
    },
    /** line: plain gold hairline. lai: ลายประจำยาม diamond chain (horizontal only). */
    pattern: {
      line: "",
      lai: "lai-prajamyam",
    },
    strength: {
      subtle: "",
      default: "",
    },
  },
  compoundVariants: [
    { orientation: "horizontal", pattern: "line", className: "h-px" },
    { pattern: "line", strength: "subtle", className: "bg-gold/35" },
    { pattern: "line", strength: "default", className: "bg-gold/60" },
    { pattern: "lai", strength: "subtle", className: "opacity-60" },
  ],
  defaultVariants: { orientation: "horizontal", pattern: "line", strength: "default" },
});

type GoldDividerProps = React.ComponentProps<"div"> &
  VariantProps<typeof goldDividerVariants>;

/** Decorative gold divider: a hairline, or the ลายประจำยาม pattern. */
function GoldDivider({
  className,
  orientation,
  pattern,
  strength,
  ...props
}: GoldDividerProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="gold-divider"
      className={cn(goldDividerVariants({ orientation, pattern, strength }), className)}
      {...props}
    />
  );
}

export { GoldDivider, goldDividerVariants };
