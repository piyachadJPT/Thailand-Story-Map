import { requireUser } from "@/api/auth/session";
import { handleRouteError, jsonOk } from "@/api/common/http";
import { enforceRateLimit } from "@/api/common/ratelimit";
import { updateStory } from "@/api/stories/service";
import { updateStorySchema } from "@/models/schemas/story";
import { revalidateStory } from "@/lib/seo/revalidate";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    await enforceRateLimit("story:update", user.id);
    const { id } = await params;
    const input = updateStorySchema.parse(await request.json());
    const updated = await updateStory(id, input, user.id);
    // Also when it went back to review: the published page must disappear.
    revalidateStory({
      slug: updated.slug,
      provinceSlug: updated.provinceSlug,
      categorySlug: updated.categorySlug,
      oldProvinceSlug: updated.previousProvinceSlug,
      oldCategorySlug: updated.previousCategorySlug,
    });
    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
