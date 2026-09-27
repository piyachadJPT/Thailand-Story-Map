import { createStory, listStories, listMapPoints } from "@/api/stories/service";
import { jsonOk, jsonPaginated, handleRouteError } from "@/api/common/http";
import { UnauthorizedError } from "@/api/common/errors";
import { createStorySchema, listStoriesQuerySchema } from "@/models/schemas";

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
    const body = createStorySchema.parse(await request.json());
    // TODO(Phase 1): resolve session user from Auth.js
    const authorId = request.headers.get("x-dev-user-id");
    if (!authorId) {
      throw new UnauthorizedError("Sign in required to create a story");
    }
    const story = await createStory(body, authorId);
    return jsonOk(story, { status: 201, message: "Story submitted" });
  } catch (error) {
    return handleRouteError(error);
  }
}
