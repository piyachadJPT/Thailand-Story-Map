import type mapboxgl from "mapbox-gl";
import { Building2, Map, Satellite, type LucideIcon } from "lucide-react";
import { readTheme } from "@/lib/theme";
import { applyThaiTint } from "./mapTint";

/** Democracy Monument — central Bangkok */
export const BANGKOK_CENTER: [number, number] = [100.5018, 13.7563];
export const BANGKOK_ZOOM = 12;

export type MapStyleId = "streets" | "satellite" | "city3d";

export const MAP_STYLES: {
  id: MapStyleId;
  label: string;
  url: string;
  icon: LucideIcon;
}[] = [
  {
    id: "streets",
    label: "ถนน",
    url: "mapbox://styles/mapbox/streets-v12",
    icon: Map,
  },
  {
    id: "satellite",
    label: "ดาวเทียม",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    icon: Satellite,
  },
  {
    id: "city3d",
    label: "เมือง 3D",
    url: "mapbox://styles/mapbox/standard",
    icon: Building2,
  },
];

export function styleUrl(id: MapStyleId) {
  if (id === "streets" && readTheme() === "dark") {
    return "mapbox://styles/mapbox/dark-v11";
  }
  return MAP_STYLES.find((style) => style.id === id)?.url ?? MAP_STYLES[0].url;
}

/** Leaves room for the desktop sidebar and the mobile bottom controls. */
export function mapPadding(): mapboxgl.PaddingOptions {
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  return { top: 72, left: wide ? 384 : 0, right: 12, bottom: wide ? 72 : 112 };
}

export const PIN_MODE_PADDING: mapboxgl.PaddingOptions = {
  top: 88,
  left: 0,
  right: 0,
  bottom: 160,
};

export function cityLightPreset() {
  return readTheme() === "dark" ? "night" : "day";
}

export function applyStylePresentation(map: mapboxgl.Map, id: MapStyleId) {
  const localized = map as mapboxgl.Map & {
    setLanguage?: (language: string) => void;
  };
  localized.setLanguage?.("th");
  // Only the plain street style is recolored; satellite and 3D keep their own look.
  if (id === "streets") applyThaiTint(map, readTheme());
  if (id !== "city3d") return;
  try {
    map.setConfigProperty("basemap", "show3dObjects", true);
    map.setConfigProperty("basemap", "lightPreset", cityLightPreset());
  } catch {
    // Standard style is the only basemap that accepts these config keys.
  }
}

/** Ease-in-out so pitch and bearing ease off instead of stopping abruptly. */
function smoothstep(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function glideCamera(map: mapboxgl.Map, id: MapStyleId) {
  if (id === "city3d") {
    map.flyTo({
      center: map.getCenter(),
      zoom: Math.max(map.getZoom(), 15.2),
      pitch: 60,
      bearing: -17,
      duration: 1700,
      curve: 1.15,
      essential: true,
    });
    return;
  }

  if (map.getPitch() < 1 && Math.abs(map.getBearing()) < 1) return;
  map.easeTo({
    pitch: 0,
    bearing: 0,
    duration: 1200,
    easing: smoothstep,
    essential: true,
  });
}
