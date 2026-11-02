import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Category chips tint the background and color the icon only; the label stays
 * in foreground ink so text contrast never depends on the category color.
 */
const chipVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border font-medium leading-none whitespace-nowrap",
    "transition-[background-color,border-color,color] duration-200",
    "outline-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-foreground",
    "data-[selected=true]:border-gold data-[selected=true]:bg-gold/15",
  ],
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-foreground",
        glass: "liquid-glass text-foreground",
        category: "text-foreground",
      },
      category: {
        ghost: "",
        history: "",
        legend: "",
        crime: "",
        local: "",
      },
      size: {
        sm: "h-7 px-2.5 text-xs [&_svg]:size-3.5",
        md: "h-9 px-3.5 text-sm [&_svg]:size-4",
      },
      interactive: {
        true: "cursor-pointer hover:border-gold/60",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "category", category: "ghost", className: "border-cat-ghost/35 bg-cat-ghost/10 [&_svg]:text-cat-ghost aria-pressed:border-cat-ghost aria-pressed:bg-cat-ghost/20" },
      { variant: "category", category: "history", className: "border-cat-history/40 bg-cat-history/10 [&_svg]:text-cat-history aria-pressed:border-cat-history aria-pressed:bg-cat-history/20" },
      { variant: "category", category: "legend", className: "border-cat-legend/35 bg-cat-legend/10 [&_svg]:text-cat-legend aria-pressed:border-cat-legend aria-pressed:bg-cat-legend/20" },
      { variant: "category", category: "crime", className: "border-cat-crime/35 bg-cat-crime/10 [&_svg]:text-cat-crime aria-pressed:border-cat-crime aria-pressed:bg-cat-crime/20" },
      { variant: "category", category: "local", className: "border-cat-local/35 bg-cat-local/10 [&_svg]:text-cat-local aria-pressed:border-cat-local aria-pressed:bg-cat-local/20" },
    ],
    defaultVariants: {
      variant: "default",
      size: "sm",
      interactive: false,
    },
  }
);

type ChipProps = Omit<React.ComponentProps<"span">, "children"> &
  VariantProps<typeof chipVariants> & {
    icon?: LucideIcon;
    children?: React.ReactNode;
    /** Render the child element (e.g. a <button> or <Link>) with chip styles. */
    asChild?: boolean;
  };

function Chip({
  className,
  variant,
  category,
  size,
  interactive,
  icon: Icon,
  asChild = false,
  children,
  ...props
}: ChipProps) {
  const classes = cn(
    chipVariants({
      variant: category ? (variant ?? "category") : variant,
      category,
      size,
      interactive: interactive ?? asChild,
    }),
    className
  );

  const Comp = asChild ? Slot : "span";

  return (
    <Comp data-slot="chip" className={classes} {...props}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      <Slottable>{children}</Slottable>
    </Comp>
  );
}

export { Chip, chipVariants, type ChipProps };
