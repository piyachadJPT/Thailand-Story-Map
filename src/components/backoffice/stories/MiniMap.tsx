import { ExternalLink, MapPin } from "lucide-react";

/**
 * Static Mapbox image of the story pin: no WebGL, nothing to scroll-trap in a
 * narrow side panel. Pin colors are URL parameters, so they mirror the
 * category tokens in globals.css as hex.
 */
const pinHex: Record<string, string> = {
  ghost: "7c5cff",
  history: "c8963e",
  legend: "2fa58a",
  crime: "e0475b",
  local: "3b8edb",
};

function staticUrl(token: string, style: "light-v11" | "dark-v11", lng: number, lat: number, color: string) {
  const pin = `pin-l+${color}(${lng.toFixed(5)},${lat.toFixed(5)})`;
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${pin}/${lng.toFixed(5)},${lat.toFixed(5)},13.5,0/640x320@2x?access_token=${encodeURIComponent(token)}&logo=false`;
}

export default function MiniMap({
  token,
  latitude,
  longitude,
  categorySlug,
  provinceName,
}: {
  token?: string;
  latitude: number;
  longitude: number;
  categorySlug: string;
  provinceName: string;
}) {
  const color = pinHex[categorySlug] ?? pinHex.history;
  const googleMaps = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  return (
    <figure className="overflow-hidden rounded-xl border border-border">
      <div className="relative aspect-2/1 bg-muted">
        {token ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={staticUrl(token, "light-v11", longitude, latitude, color)}
              alt={`แผนที่ตำแหน่งเรื่องใน${provinceName}`}
              loading="lazy"
              className="size-full object-cover dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={staticUrl(token, "dark-v11", longitude, latitude, color)}
              alt=""
              loading="lazy"
              className="hidden size-full object-cover dark:block"
            />
          </>
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <MapPin aria-hidden="true" className="size-6" strokeWidth={1.75} />
          </div>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs">
        <span className="text-muted-foreground tabular-nums">
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </span>
        <a
          href={googleMaps}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
        >
          Google Maps
          <ExternalLink aria-hidden="true" className="size-3" />
        </a>
      </figcaption>
    </figure>
  );
}
