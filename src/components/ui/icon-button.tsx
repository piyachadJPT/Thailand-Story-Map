import { cva, type VariantProps } from "class-variance-authority";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconButtonSizes = cva("p-0", {
  variants: {
    size: {
      sm: "size-9 [&_svg:not([class*='size-'])]:size-4",
      md: "size-11 [&_svg:not([class*='size-'])]:size-5",
      lg: "size-12 [&_svg:not([class*='size-'])]:size-5",
    },
  },
  defaultVariants: { size: "md" },
});

type IconButtonProps = Omit<ButtonProps, "size" | "aria-label"> &
  VariantProps<typeof iconButtonSizes> & {
    /** Required: icon-only buttons have no visible text. */
    "aria-label": string;
  };

/** Icon-only button (shape follows --radius-control). Defaults to the ghost variant. */
function IconButton({
  className,
  size,
  variant = "ghost",
  ...props
}: IconButtonProps) {
  return (
    <Button
      data-slot="icon-button"
      variant={variant}
      className={cn(iconButtonSizes({ size }), className)}
      {...props}
    />
  );
}

export { IconButton, type IconButtonProps };
