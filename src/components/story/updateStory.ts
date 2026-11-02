import { responseErrorMessage } from "@/utils/errorHandler";

/** PATCH /api/stories/manage/:id with the edit form's values (unchanged payload). */
export async function updateStory(
  storyId: string,
  form: FormData,
  { coverUrl, categoryId }: { coverUrl: string | null; categoryId: string }
) {
  const response = await fetch(`/api/stories/manage/${encodeURIComponent(storyId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      coverUrl,
      title: String(form.get("title")).trim(),
      summary: String(form.get("summary")).trim(),
      content: String(form.get("content")).trim(),
      categoryId,
      provinceId: String(form.get("provinceId")),
      latitude: Number(form.get("latitude")),
      longitude: Number(form.get("longitude")),
      sourceUrl: String(form.get("sourceUrl")).trim() || null,
      isSensitive: form.get("isSensitive") === "on",
    }),
  });
  const body = await response.json();
  if (!response.ok || !body.success || !body.data)
    throw new Error(responseErrorMessage(response, body, "บันทึกไม่สำเร็จ กรุณาลองใหม่"));
  return body.data as { status: string };
}
