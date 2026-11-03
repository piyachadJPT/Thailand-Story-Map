import Link from "next/link";

type FooterColumnProps = {
  title: string;
  links: readonly { name: string; href: string }[];
};

export default function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-xs font-medium tracking-widest text-gold-ink">
        {title}
      </h3>
      <ul role="list" className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              // The map page is heavy (Mapbox); load it on click, not on sight.
              prefetch={link.href === "/" ? false : undefined}
              className="group inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span
                aria-hidden="true"
                className="h-px w-2 bg-border transition-all duration-200 group-hover:w-4 group-hover:bg-gold"
              />
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
