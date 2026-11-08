import Link from "next/link";

type FooterColumnProps = {
  title: string;
  links: readonly { name: string; href: string }[];
};

export default function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-chad">
        {title}
      </h3>
      <ul role="list" className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              // The map page is heavy (Mapbox); load it on click, not on sight.
              prefetch={link.href === "/" ? false : undefined}
              className="inline-flex min-h-6 items-center rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
