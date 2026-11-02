import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full px-4 pt-6 pb-16 sm:px-6 sm:pt-10", {
  variants: {
    width: {
      narrow: "max-w-3xl",
      default: "max-w-5xl",
      wide: "max-w-6xl",
    },
  },
  defaultVariants: { width: "default" },
});

type PageContainerProps = React.ComponentProps<"div"> & VariantProps<typeof containerVariants>;

/** Page width and gutters (16px on phones). */
export default function PageContainer({ width, className, ...props }: PageContainerProps) {
  return <div className={cn(containerVariants({ width }), className)} {...props} />;
}
