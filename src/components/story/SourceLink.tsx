import { ArrowUpRight, Link2 } from "lucide-react";

type SourceLinkProps = { url: string; host: string; path: string };

/** แหล่งข้อมูลอ้างอิง — external link card showing host and path. */
export default function SourceLink({ url, host, path }: SourceLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card/70 p-4 outline-none transition-colors hover:border-gold/60 focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold-ink"
      >
        <Link2 className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium tracking-widest text-gold-ink">
          แหล่งข้อมูลอ้างอิง
        </span>
        <span className="block truncate font-medium text-foreground">{host}</span>
        {path && path !== "/" ? (
          <span className="block truncate text-xs text-muted-foreground">{path}</span>
        ) : null}
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground motion-reduce:transition-none"
      />
    </a>
  );
}
