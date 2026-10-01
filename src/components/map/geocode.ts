export type PlaceHit = {
  id: string;
  title: string;
  subtitle: string;
  longitude: number;
  latitude: number;
  zoom: number;
  kind?: string;
};

type GeocodeFeature = {
  id: string;
  text?: string;
  place_name?: string;
  center?: [number, number];
  place_type?: string[];
};

function zoomFor(placeTypes: string[]) {
  if (placeTypes.includes("address") || placeTypes.includes("poi")) return 16;
  if (placeTypes.includes("neighborhood") || placeTypes.includes("locality"))
    return 14;
  if (placeTypes.includes("place")) return 12;
  if (placeTypes.includes("district")) return 11;
  if (placeTypes.includes("region")) return 8;
  return 13;
}

export async function searchThailandPlaces(
  query: string,
  token: string,
  signal: AbortSignal,
  proximity?: string
): Promise<PlaceHit[]> {
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "th");
  url.searchParams.set("language", "th");
  url.searchParams.set("limit", "10");
  if (proximity) url.searchParams.set("proximity", proximity);
  url.searchParams.set(
    "types",
    "address,postcode,neighborhood,locality,place,district,region"
  );

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("ค้นหาสถานที่ไม่สำเร็จ");
  const body = (await response.json()) as { features?: GeocodeFeature[] };

  return (body.features ?? [])
    .filter((feature) => feature.center && feature.text)
    .map((feature) => {
      const [longitude, latitude] = feature.center as [number, number];
      const subtitle =
        feature.place_name && feature.place_name !== feature.text
          ? feature.place_name
          : "";
      return {
        id: feature.id,
        title: feature.text as string,
        subtitle,
        longitude,
        latitude,
        zoom: zoomFor(feature.place_type ?? []),
      };
    });
}

export function coordinatePlace(query: string): PlaceHit | null {
  const match = query
    .trim()
    .match(/^([+-]?\d+(?:\.\d+)?)\s*[,，]\s*([+-]?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return {
    id: `coordinates-${latitude}-${longitude}`,
    title: "ตำแหน่งจากพิกัด",
    subtitle: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    latitude,
    longitude,
    zoom: 17,
    kind: "พิกัด",
  };
}

type SearchFeature = {
  geometry?: { coordinates?: number[] };
  properties?: {
    mapbox_id?: string;
    name?: string;
    name_preferred?: string;
    full_address?: string;
    place_formatted?: string;
    feature_type?: string;
  };
};

export function mapSearchResults(features: SearchFeature[]): PlaceHit[] {
  const labels: Record<string, string> = {
    poi: "สถานที่สำคัญ",
    address: "ที่อยู่",
    street: "ถนน / ซอย",
    postcode: "รหัสไปรษณีย์",
    neighborhood: "ย่าน",
    locality: "ตำบล / แขวง",
    district: "อำเภอ / เขต",
    place: "เมือง",
    region: "จังหวัด",
  };
  const hits = features.flatMap((feature): PlaceHit[] => {
    const coordinates = feature.geometry?.coordinates;
    const properties = feature.properties;
    const title = properties?.name_preferred ?? properties?.name;
    if (
      !coordinates ||
      coordinates.length < 2 ||
      !title ||
      !coordinates.slice(0, 2).every(Number.isFinite) ||
      Math.abs(coordinates[0]) > 180 ||
      Math.abs(coordinates[1]) > 90
    )
      return [];
    const type = properties?.feature_type ?? "";
    return [
      {
        id:
          properties?.mapbox_id ??
          `${coordinates[0]}-${coordinates[1]}-${title}`,
        title,
        subtitle: properties?.full_address ?? properties?.place_formatted ?? "",
        longitude: coordinates[0],
        latitude: coordinates[1],
        zoom: type === "street" ? 16 : zoomFor([type]),
        kind: labels[type] ?? "สถานที่",
      },
    ];
  });
  return [...new Map(hits.map((hit) => [hit.id, hit])).values()];
}

/** POI and street search for the map, with address geocoding as a fallback. */
export async function searchMapPlaces(
  query: string,
  token: string,
  signal: AbortSignal,
  proximity?: string
): Promise<PlaceHit[]> {
  const url = new URL("https://api.mapbox.com/search/searchbox/v1/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "th");
  url.searchParams.set("language", "th");
  url.searchParams.set("limit", "10");
  url.searchParams.set("auto_complete", "true");
  url.searchParams.set(
    "types",
    "poi,address,street,postcode,neighborhood,locality,place,district,region"
  );
  if (proximity) url.searchParams.set("proximity", proximity);
  try {
    const response = await fetch(url, { signal });
    if (response.ok) {
      const body = (await response.json()) as { features?: SearchFeature[] };
      const hits = mapSearchResults(body.features ?? []);
      if (hits.length) return hits;
    }
  } catch (error) {
    if (signal.aborted) throw error;
  }
  return searchThailandPlaces(query, token, signal, proximity);
}
