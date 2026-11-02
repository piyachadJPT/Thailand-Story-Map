import { handleRouteError, jsonOk } from "@/api/common/http";
import { listAdminStories } from "@/api/admin/stories";
import { requireAdminSession } from "@/api/admin/session";
import { adminStoriesQuerySchema } from "@/models/schemas/admin";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const query = adminStoriesQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonOk(await listAdminStories(query));
  } catch (error) {
    return handleRouteError(error);
  }
}
