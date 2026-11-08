import mapboxgl from "mapbox-gl";
import { createDraftPin } from "./MapPin";
import { mapPadding, PIN_MODE_PADDING } from "./mapStyles";

type Point = { longitude: number; latitude: number };

function selectLocation(detail: Point) {
  window.dispatchEvent(new CustomEvent("story-location-selected", { detail }));
}

/**
 * Map side of the story composer: pin-placing mode ("story-pin-mode"),
 * the draggable draft pin ("story-draft-location") and map clicks.
 */
export function attachComposerLayer(map: mapboxgl.Map) {
  let placingPin = false;
  let draftMarker: mapboxgl.Marker | null = null;

  const padding = () => (placingPin ? PIN_MODE_PADDING : mapPadding());

  const onPinMode = (event: Event) => {
    placingPin = (event as CustomEvent<boolean>).detail;
    map.getCanvas().style.cursor = placingPin ? "crosshair" : "";
    map.setPadding(padding());
  };

  const onDraftLocation = (event: Event) => {
    const point = (event as CustomEvent<Point | null>).detail;
    draftMarker?.remove();
    draftMarker = point
      ? new mapboxgl.Marker({
          element: createDraftPin(),
          anchor: "center",
          draggable: true,
        })
          .setLngLat([point.longitude, point.latitude])
          .addTo(map)
      : null;
    draftMarker?.on("dragend", () => {
      const location = draftMarker?.getLngLat();
      if (!location) return;
      selectLocation({ longitude: location.lng, latitude: location.lat });
    });
  };

  const onMapClick = (event: mapboxgl.MapMouseEvent) => {
    if (!placingPin) return;
    selectLocation({ longitude: event.lngLat.lng, latitude: event.lngLat.lat });
  };

  map.on("click", onMapClick);
  window.addEventListener("story-pin-mode", onPinMode);
  window.addEventListener("story-draft-location", onDraftLocation);

  return {
    /** Current padding: roomy while placing a pin, normal otherwise. */
    padding,
    dispose() {
      map.off("click", onMapClick);
      window.removeEventListener("story-pin-mode", onPinMode);
      window.removeEventListener("story-draft-location", onDraftLocation);
      draftMarker?.remove();
    },
  };
}
