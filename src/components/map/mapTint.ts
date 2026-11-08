/**
 * Recolors a Mapbox basemap (streets-v12, light-v11, dark-v11) to the site
 * palette at runtime, so no custom Studio style is needed: plaster land,
 * indigo water, sage parks, gold-tinted main roads (lacquer + gold in dark).
 * Not for the satellite or 3D styles.
 */

type StyleLayer = { id: string; type: string; layout?: object };

/** The slice of mapboxgl.Map this file uses; lets tests pass a fake. */
export type TintTarget = {
  getStyle(): { layers?: StyleLayer[] } | undefined;
  setPaintProperty(layerId: string, name: string, value: unknown): unknown;
};

type Palette = {
  land: string;
  landuse: string;
  park: string;
  water: string;
  building: string;
  roadMinor: string;
  roadMid: string;
  roadMajor: string;
  casing: string;
  casingMajor: string;
  label: string;
  labelWater: string;
  halo: string;
};

const light: Palette = {
  land: "#ebe3d0",
  landuse: "#e5dcc7",
  park: "#d5dcc0",
  water: "#bccbd9",
  building: "#ddd2ba",
  roadMinor: "#faf6ec",
  roadMid: "#fdf9ef",
  roadMajor: "#f0d9a8",
  casing: "#d7cbb0",
  casingMajor: "#d9bd86",
  label: "#4a4a55",
  labelWater: "#5c7792",
  halo: "#f1ebdd",
};

const dark: Palette = {
  land: "#16130f",
  landuse: "#1b1712",
  park: "#1c2017",
  water: "#17202f",
  building: "#221d17",
  roadMinor: "#2b251d",
  roadMid: "#352d22",
  roadMajor: "#4a3b22",
  casing: "#0f0d0a",
  casingMajor: "#2a2012",
  label: "#a89a7e",
  labelWater: "#5d7392",
  halo: "#16130f",
};

const PARK_CLASSES = ["park", "national_park", "grass", "scrub", "wood", "cemetery", "golf_course", "pitch"];
const SKIP_ROADS = /rail|path|steps|ferry|oneway|arrow|label|construction|shield|junction/;
const SKIP_LABELS = /shield|junction/;

export function applyThaiTint(map: TintTarget, theme: "light" | "dark") {
  const p = theme === "dark" ? dark : light;
  const set = (id: string, name: string, value: unknown) => {
    try {
      map.setPaintProperty(id, name, value);
    } catch {
      // The layer is missing a property in this style version; leave it as is.
    }
  };

  for (const { id, type, layout } of map.getStyle()?.layers ?? []) {
    if (type === "background") {
      set(id, "background-color", p.land);
    } else if (type === "fill") {
      if (/^water(-shadow)?$/.test(id)) set(id, "fill-color", p.water);
      else if (/^(wetland|national-park|park)/.test(id)) set(id, "fill-color", p.park);
      else if (/^(landuse|landcover)/.test(id)) {
        set(id, "fill-color", ["match", ["get", "class"], PARK_CLASSES, p.park, p.landuse]);
      } else if (id === "building") set(id, "fill-color", p.building);
      else if (id === "aeroway-polygon") set(id, "fill-color", p.landuse);
    } else if (type === "fill-extrusion") {
      if (/building/.test(id)) set(id, "fill-extrusion-color", p.building);
    } else if (type === "line") {
      if (/^waterway/.test(id)) {
        set(id, "line-color", p.water);
      } else if (/^(road|bridge|tunnel)-/.test(id) && !SKIP_ROADS.test(id)) {
        const major = /motorway|trunk|primary/.test(id);
        if (id.endsWith("-case")) {
          set(id, "line-color", major ? p.casingMajor : p.casing);
        } else {
          const mid = /secondary|tertiary/.test(id);
          set(id, "line-color", major ? p.roadMajor : mid ? p.roadMid : p.roadMinor);
        }
      }
    } else if (type === "symbol") {
      const hasText = Boolean((layout as Record<string, unknown> | undefined)?.["text-field"]);
      if (hasText && !SKIP_LABELS.test(id)) {
        set(id, "text-color", /water/.test(id) ? p.labelWater : p.label);
        set(id, "text-halo-color", p.halo);
      }
    }
  }
}
