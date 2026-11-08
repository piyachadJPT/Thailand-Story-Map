import { ArrowUpRight, Link2 } from "lucide-react";

type SourceLinkProps = { url: string; host: string; path: string };

/** แหล่งข้อมูลอ้างอิง — external link card showing host and path. */
export default function SourceLink({ url, host, path }: SourceLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="nofollow noopener noreferrer"
      title={url}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 outline-none transition-colors hover:border-gold focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden="true"
        className="shrink-0 text-gold-ink"
      >
        <Link2 className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-chad">
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
