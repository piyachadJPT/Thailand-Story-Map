import type { StoryListItem } from "@/models/types/story";
import type { PlaceHit } from "../geocode";
import { responseErrorMessage } from "@/utils/errorHandler";

export async function fetchStoryPage({
  q,
  categorySlug,
  page,
  signal,
}: {
  q: string;
  categorySlug: string | null;
  page: number;
  signal: AbortSignal;
}) {
  const params = new URLSearchParams({
    limit: "20",
    page: String(page),
    sort: "recent",
  });
  if (q) params.set("q", q);
  if (categorySlug) params.set("categorySlug", categorySlug);
  const response = await fetch(`/api/stories?${params}`, { signal });
  const body = (await response.json()) as {
    data?: StoryListItem[];
    meta?: { total: number };
    message?: string;
  };
  if (!response.ok) throw new Error(body.message || "ค้นหาไม่สำเร็จ");
  return {
    stories: body.data ?? [],
    total: body.meta?.total ?? body.data?.length ?? 0,
  };
}

export async function fetchPlaces({
  q,
  center,
  signal,
}: {
  q: string;
  center: { longitude: number; latitude: number };
  signal: AbortSignal;
}) {
  const params = new URLSearchParams({
    q,
    mode: "map",
    proximity: `${center.longitude},${center.latitude}`,
  });
  const response = await fetch(`/api/geocode?${params}`, { signal });
  const body = (await response.json()) as {
    data?: PlaceHit[];
    message?: string;
  };
  if (!response.ok) throw new Error(responseErrorMessage(response, body, "ค้นหาสถานที่ไม่สำเร็จ"));
  return body.data ?? [];
}
