import { jsonError, jsonOk, handleRouteError } from "@/api/common/http";
import { getMapboxToken } from "@/config/mapbox";
import { enforceRateLimit } from "@/api/common/ratelimit";
import { getClientIp } from "@/api/common/request";
import {
  coordinatePlace,
  searchMapPlaces,
  searchThailandPlaces,
} from "@/components/map/geocode";

export async function GET(request: Request) {
  try {
    await enforceRateLimit("geocode", `ip:${getClientIp(request)}`);
    const params = new URL(request.url).searchParams;
    const query = params.get("q")?.trim() ?? "";
    if (!query) return jsonOk([]);
    if (query.length > 256)
      return jsonError("กรุณาระบุคำค้นไม่เกิน 256 ตัวอักษร");
    const coordinate = coordinatePlace(query);
    if (coordinate) return jsonOk([coordinate]);
    const rawProximity = params.get("proximity");
    let proximity: string | undefined;
    if (rawProximity) {
      const parts = rawProximity.split(",");
      const numbers = parts.map(Number);
      if (
        parts.length !== 2 ||
        parts.some((part) => !part.trim()) ||
        !numbers.every(Number.isFinite) ||
        Math.abs(numbers[0]) > 180 ||
        Math.abs(numbers[1]) > 90
      )
        return jsonError("พิกัดอ้างอิงไม่ถูกต้อง");
      proximity = numbers.join(",");
    }

    const token = getMapboxToken();
    if (!token) return jsonError("ยังไม่ได้ตั้งค่า Mapbox token", 500);

    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(10000),
    ]);
    const places =
      params.get("mode") === "map"
        ? await searchMapPlaces(query, token, signal, proximity)
        : await searchThailandPlaces(query, token, signal);
    return jsonOk(places);
  } catch (error) {
    return handleRouteError(error);
  }
}
