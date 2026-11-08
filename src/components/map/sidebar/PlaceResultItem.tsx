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
        className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-left outline-none transition-colors hover:border-gold focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-gold-ink" />
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
