import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassPanelVariants = cva("text-foreground", {
  variants: {
    surface: {
      /** Floating surface over the map or the page (solid card + hairline). */
      glass: "liquid-glass",
      /** Card surface for long reading content. */
      solid: "border border-border bg-card text-card-foreground",
    },
    radius: {
      card: "rounded-lg",
      panel: "rounded-panel",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4 sm:p-5",
      lg: "p-5 sm:p-7",
    },
    /** Gold rule along the top edge. */
    gilded: {
      true: "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-gold",
      false: "",
    },
  },
  compoundVariants: [
    // The solid surface needs a positioning context for the gold hairline.
    { surface: "solid", gilded: true, className: "relative" },
  ],
  defaultVariants: {
    surface: "glass",
    radius: "panel",
    padding: "md",
    gilded: false,
  },
});

type GlassPanelElement = "div" | "section" | "aside" | "article" | "header" | "nav";

type GlassPanelProps = React.ComponentProps<"div"> &
  VariantProps<typeof glassPanelVariants> & {
    as?: GlassPanelElement;
  };

function GlassPanel({
  as: Comp = "div",
  className,
  surface,
  radius,
  padding,
  gilded,
  ...props
}: GlassPanelProps) {
  return (
    <Comp
      data-slot="glass-panel"
      className={cn(
        glassPanelVariants({ surface, radius, padding, gilded }),
        className
      )}
      {...props}
    />
  );
}

export { GlassPanel, glassPanelVariants, type GlassPanelProps };
