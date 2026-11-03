import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  onNavigate?: () => void;
  /** Classes for the site name; hide it with responsive classes as needed. */
  nameClassName?: string;
  priority?: boolean;
};

/** Logo in a gold-ringed medallion, plus the site name. */
export default function BrandMark({
  onNavigate,
  nameClassName,
  priority,
}: BrandMarkProps) {
  return (
    <Link
      href="/"
      prefetch={false}
      onClick={onNavigate}
      aria-label={siteConfig.name}
      className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-full p-0.5 pr-2 outline-none transition-colors hover:bg-foreground/6 focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-background ring-1 ring-gold/50 transition-shadow group-hover:ring-gold">
        <Image
          src="/logo.png"
          alt=""
          width={36}
          height={36}
          priority={priority}
          className="size-8 object-contain"
        />
      </span>
      <span
        className={cn(
          "truncate font-heading text-base font-semibold tracking-tight text-foreground",
          nameClassName
        )}
      >
        {siteConfig.shortName}
      </span>
    </Link>
  );
}
