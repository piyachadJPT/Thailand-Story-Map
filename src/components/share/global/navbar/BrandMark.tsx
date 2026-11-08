import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  onNavigate?: () => void;
  className?: string;
  priority?: boolean;
};

/** Logo plus the Thai site name, set on the nav bar. */
export default function BrandMark({ onNavigate, className, priority }: BrandMarkProps) {
  return (
    <Link
      href="/"
      prefetch={false}
      onClick={onNavigate}
      aria-label={siteConfig.name}
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2.5 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-nav-rule",
        className
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-background ring-1 ring-nav-rule/70">
        <Image
          src="/logo.png"
          alt=""
          width={32}
          height={32}
          priority={priority}
          className="size-7 object-contain"
        />
      </span>
      {/* Tablets hide the name to make room for the inline links. */}
      <span className="min-w-0 leading-tight md:max-lg:hidden">
        <span className="block truncate font-heading text-base font-bold">
          {siteConfig.nameTh}
        </span>
        <span className="block truncate text-[0.625rem] font-medium tracking-[0.14em] uppercase opacity-70">
          {siteConfig.name}
        </span>
      </span>
    </Link>
  );
}
