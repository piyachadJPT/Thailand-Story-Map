import { jsonError, jsonOk, handleRouteError } from "@/api/common/http";
import { getMapboxToken } from "@/config/mapbox";
import { searchThailandPlaces } from "@/components/map/geocode";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (!query) return jsonOk([]);

    const token = getMapboxToken();
    if (!token) return jsonError("ยังไม่ได้ตั้งค่า Mapbox token", 500);

    const places = await searchThailandPlaces(query, token, AbortSignal.timeout(8000));
    return jsonOk(places);
  } catch (error) {
    return handleRouteError(error);
  }
}
