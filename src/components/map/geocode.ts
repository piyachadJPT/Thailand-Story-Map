export type PlaceHit = {
  id: string;
  title: string;
  subtitle: string;
  longitude: number;
  latitude: number;
  zoom: number;
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
  if (placeTypes.includes("neighborhood") || placeTypes.includes("locality")) return 14;
  if (placeTypes.includes("place")) return 12;
  if (placeTypes.includes("district")) return 11;
  if (placeTypes.includes("region")) return 8;
  return 13;
}

export async function searchThailandPlaces(
  query: string,
  token: string,
  signal: AbortSignal,
): Promise<PlaceHit[]> {
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "th");
  url.searchParams.set("language", "th");
  url.searchParams.set("limit", "6");
  url.searchParams.set("proximity", "100.5018,13.7563");
  url.searchParams.set("types", "poi,address,neighborhood,locality,place,district,region");

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("ค้นหาสถานที่ไม่สำเร็จ");
  const body = (await response.json()) as { features?: GeocodeFeature[] };

  return (body.features ?? [])
    .filter((feature) => feature.center && feature.text)
    .map((feature) => {
      const [longitude, latitude] = feature.center as [number, number];
      const subtitle = feature.place_name && feature.place_name !== feature.text ? feature.place_name : "";
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
