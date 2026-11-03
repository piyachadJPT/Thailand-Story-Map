import { createStory, listStories, listMapPoints } from "@/api/stories/service";
import { jsonOk, jsonPaginated, handleRouteError } from "@/api/common/http";
import { requireUser } from "@/api/auth/session";
import { enforceRateLimit } from "@/api/common/ratelimit";
import { createStorySchema, listStoriesQuerySchema } from "@/models/schemas";
import { revalidateStory } from "@/lib/seo/revalidate";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const query = listStoriesQuerySchema.parse(raw);

    if (url.searchParams.get("view") === "map") {
      const points = await listMapPoints(query);
      return jsonOk(points);
    }

    const result = await listStories(query);
    return jsonPaginated(result.data, result.meta);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const author = await requireUser();
    await enforceRateLimit("story:create", author.id);
    const body = createStorySchema.parse(await request.json());
    const story = await createStory(body, author.id);
    if (story.status === "APPROVED") revalidateStory(story);
    return jsonOk(story, { status: 201, message: "Story submitted" });
  } catch (error) {
    return handleRouteError(error);
  }
}
