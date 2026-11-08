import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassPanelVariants = cva("text-foreground", {
  variants: {
    surface: {
      /** Frosted floating material (over the map or the page canvas). */
      glass: "liquid-glass",
      /** Opaque card surface for long reading content. */
      solid: "border border-border bg-card text-card-foreground",
    },
    radius: {
      card: "rounded-2xl",
      panel: "rounded-panel",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4 sm:p-5",
      lg: "p-5 sm:p-7",
    },
    /** Hairline of gold leaf along the top edge. */
    gilded: {
      true: "after:pointer-events-none after:absolute after:inset-x-8 after:top-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-gold/70 after:to-transparent",
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
