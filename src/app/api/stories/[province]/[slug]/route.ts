import { z } from "zod";
import { getStoryByProvinceAndSlug } from "@/api/stories/service";
import { recordStoryView } from "@/api/stories/views";
import { getSessionUser } from "@/api/auth/session";
import { jsonOk, handleRouteError } from "@/api/common/http";

type Params = { params: Promise<{ province: string; slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { province, slug } = await params;
    const story = await getStoryByProvinceAndSlug(province, slug);
    return jsonOk(story);
  } catch (error) {
    return handleRouteError(error);
  }
}

const storyIdSchema = z.string().uuid();

/**
 * POST /api/stories/:id/view — counts a read (sent by the story page after load).
 * It lives here because Next.js allows only one dynamic name per path level.
 * Always 204, so callers cannot tell whether the view was counted.
 */
export async function POST(request: Request, { params }: Params) {
  const { province: id, slug: action } = await params;
  if (action !== "view") return new Response(null, { status: 405 });
  const storyId = storyIdSchema.safeParse(id);
  if (storyId.success) {
    try {
      const user = await getSessionUser().catch(() => null);
      await recordStoryView(request, storyId.data, user?.id);
    } catch (error) {
      console.error("[story:view]", error);
    }
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
