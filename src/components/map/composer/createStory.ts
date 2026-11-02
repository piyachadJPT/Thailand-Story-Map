import type { StoryMapPoint } from "@/models/types/story";
import type { Point } from "@/components/story/form/types";

/** Builds the POST /api/stories payload from the form (same shape as before). */
export function buildStoryPayload(
  form: FormData,
  { point, provinceId, categoryId, isCrime }: {
    point: Point;
    provinceId: string;
    categoryId: string;
    isCrime: boolean;
  }
) {
  const sourceUrl = String(form.get("sourceUrl") ?? "").trim();
  return {
    title: String(form.get("title") ?? "").trim(),
    slug: `story-${Date.now()}`,
    summary: String(form.get("summary") ?? "").trim(),
    content: String(form.get("content") ?? "").trim(),
    latitude: point.latitude,
    longitude: point.longitude,
    provinceId,
    categoryId,
    ...(sourceUrl ? { sourceUrl } : {}),
    isSensitive: isCrime,
    tagIds: [],
    images: [],
  };
}

export async function createStory(
  payload: ReturnType<typeof buildStoryPayload>,
  coverUrl: string | null
) {
  const response = await fetch("/api/stories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, coverUrl }),
  });
  const body = (await response.json()) as {
    success?: boolean;
    message?: string;
    data?: { status: string; mapPoint?: StoryMapPoint | null };
  };
  if (!response.ok) throw new Error(body.message || "บันทึกเรื่องราวไม่สำเร็จ");
  if (!body.success || !body.data) throw new Error(body.message || "บันทึกเรื่องราวไม่สำเร็จ");
  return body.data;
}
