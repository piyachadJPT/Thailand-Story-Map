import mapboxgl from "mapbox-gl";
import type { PlaceHit } from "./geocode";
import { createPlacePin, PIN_POPUP_OFFSET, type PinIconSource } from "./MapPin";

/** Gold pin + small popup for a place chosen in search ("map-search-location"). */
export function attachPlaceLayer(map: mapboxgl.Map, getIcon: PinIconSource) {
  let marker: mapboxgl.Marker | null = null;

  const onSearchLocation = (event: Event) => {
    const place = (event as CustomEvent<PlaceHit>).detail;
    marker?.remove();
    const content = document.createElement("div");
    content.className = "p-4 pr-10";
    const title = document.createElement("p");
    title.className = "font-heading text-sm font-semibold text-foreground";
    title.textContent = place.title;
    const address = document.createElement("p");
    address.className = "mt-1 text-xs text-muted-foreground";
    address.textContent = place.subtitle;
    content.append(title, address);
    marker = new mapboxgl.Marker({ element: createPlacePin(getIcon), anchor: "bottom" })
      .setLngLat([place.longitude, place.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: PIN_POPUP_OFFSET, className: "story-map-popup" }).setDOMContent(
          content
        )
      )
      .addTo(map);
    marker.togglePopup();
  };

  window.addEventListener("map-search-location", onSearchLocation);
  return () => {
    window.removeEventListener("map-search-location", onSearchLocation);
    marker?.remove();
  };
}
