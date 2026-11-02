import { MapPin } from "lucide-react";
import type { PlaceHit } from "../geocode";

type PlaceResultItemProps = {
  place: PlaceHit;
  onSelect: (place: PlaceHit) => void;
};

/** Place result from the geocoder: flies the map to it. */
export default function PlaceResultItem({ place, onSelect }: PlaceResultItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(place)}
        className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card/50 p-3.5 text-left outline-none transition-colors hover:border-gold/50 hover:bg-card/80 focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold-ink">
          <MapPin aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">
            {place.title}
          </span>
          <span className="mt-0.5 block text-xs text-gold-ink">
            {place.kind ?? "สถานที่"} · ดูบนแผนที่
          </span>
          {place.subtitle ? (
            <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
              {place.subtitle}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}
