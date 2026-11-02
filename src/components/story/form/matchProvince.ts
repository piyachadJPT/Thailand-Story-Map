import type { PlaceHit } from "@/components/map/geocode";
import type { FormOption } from "./types";

/** Guess the province from a place's title and address. */
export function matchProvince(place: PlaceHit, provinces: FormOption[]) {
  const address = `${place.title} ${place.subtitle}`;
  return (
    provinces.find((province) => address.includes(province.name)) ??
    (address.includes("กรุงเทพ")
      ? provinces.find((province) => province.slug === "bangkok")
      : undefined)
  );
}
