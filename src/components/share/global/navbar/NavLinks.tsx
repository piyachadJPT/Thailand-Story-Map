import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { isActiveLink, navLinks } from "./links";

const listVariants = cva("min-w-0", {
  variants: {
    layout: {
      inline: "flex items-center gap-0.5",
      stacked: "flex flex-col gap-1",
    },
  },
  defaultVariants: { layout: "inline" },
});

const linkVariants = cva(
  [
    "relative shrink-0 text-sm font-medium whitespace-nowrap outline-none",
    "transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/40",
  ],
  {
    variants: {
      layout: {
        // On the nav bar: the current page gets a gold underline, not a filled pill.
        inline:
          "rounded-control px-3 py-2 text-nav-foreground/75 hover:bg-nav-foreground/10 hover:text-nav-foreground focus-visible:ring-nav-rule aria-[current=page]:text-nav-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:bottom-0.5 aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-nav-rule",
        stacked:
          "flex min-h-11 items-center rounded-control px-3 text-foreground hover:bg-foreground/6 aria-[current=page]:bg-accent aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-2.5 aria-[current=page]:before:left-0 aria-[current=page]:before:w-0.5 aria-[current=page]:before:bg-gold",
      },
    },
    defaultVariants: { layout: "inline" },
  }
);

type NavLinksProps = VariantProps<typeof listVariants> & {
  pathname: string;
  onNavigate?: () => void;
  id?: string;
  hidden?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/** Main navigation links. `children` render after the links (e.g. auth). */
export default function NavLinks({
  pathname,
  layout,
  onNavigate,
  id,
  hidden,
  className,
  children,
}: NavLinksProps) {
  return (
    <nav
      id={id}
      hidden={hidden}
      aria-label="เมนูหลัก"
      className={cn(listVariants({ layout }), className)}
    >
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          prefetch={link.href === "/" ? false : undefined}
          onClick={onNavigate}
          aria-current={isActiveLink(pathname, link.href) ? "page" : undefined}
          className={linkVariants({ layout })}
        >
          {link.name}
        </Link>
      ))}
      {children}
    </nav>
  );
}
