import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const goldDividerVariants = cva("shrink-0 from-transparent to-transparent", {
  variants: {
    orientation: {
      horizontal: "h-px w-full bg-linear-to-r",
      vertical: "h-5 w-px bg-linear-to-b",
    },
    strength: {
      subtle: "via-gold/40",
      default: "via-gold/60",
    },
  },
  defaultVariants: { orientation: "horizontal", strength: "default" },
});

type GoldDividerProps = React.ComponentProps<"div"> &
  VariantProps<typeof goldDividerVariants>;

/** Decorative gold-leaf hairline that fades out at both ends. */
function GoldDivider({
  className,
  orientation,
  strength,
  ...props
}: GoldDividerProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="gold-divider"
      className={cn(goldDividerVariants({ orientation, strength }), className)}
      {...props}
    />
  );
}

export { GoldDivider, goldDividerVariants };
