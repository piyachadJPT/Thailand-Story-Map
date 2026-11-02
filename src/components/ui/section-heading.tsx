import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionHeadingVariants = cva("flex flex-col gap-3", {
  variants: {
    align: {
      start: "items-start text-left",
      center: "items-center text-center",
    },
  },
  defaultVariants: { align: "start" },
});

const titleVariants = cva(
  "font-heading font-semibold tracking-tight text-foreground",
  {
    variants: {
      size: {
        sm: "text-lg sm:text-xl",
        md: "text-2xl sm:text-3xl",
        lg: "text-3xl sm:text-5xl",
      },
    },
    defaultVariants: { size: "md" },
  }
);

type SectionHeadingProps = Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof sectionHeadingVariants> &
  VariantProps<typeof titleVariants> & {
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    as?: "h1" | "h2" | "h3";
    /** id on the heading element, for aria-labelledby. */
    titleId?: string;
  };

function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
  titleId,
  align,
  size,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      data-slot="section-heading"
      className={cn(sectionHeadingVariants({ align }), className)}
      {...props}
    >
      {eyebrow ? (
        <p className="inline-flex items-center gap-2.5 text-xs font-medium tracking-widest text-gold-ink">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          {eyebrow}
        </p>
      ) : null}
      <Heading
        id={titleId}
        data-slot="section-title"
        className={titleVariants({ size })}
      >
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-muted-foreground",
            size === "lg" ? "text-base sm:text-lg" : size === "sm" ? "text-sm" : "text-base"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export { SectionHeading, type SectionHeadingProps };
