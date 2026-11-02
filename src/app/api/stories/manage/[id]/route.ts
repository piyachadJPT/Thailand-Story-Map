import { requireUser } from "@/api/auth/session";
import { handleRouteError, jsonOk } from "@/api/common/http";
import { updateStory } from "@/api/stories/service";
import { updateStorySchema } from "@/models/schemas/story";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const input = updateStorySchema.parse(await request.json());
    return jsonOk(await updateStory(id, input, user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
