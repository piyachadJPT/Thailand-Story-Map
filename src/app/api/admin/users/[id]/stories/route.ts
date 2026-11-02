import { z } from "zod";
import { handleRouteError, jsonOk } from "@/api/common/http";
import { listAdminStories } from "@/api/admin/stories";
import { requireAdminSession } from "@/api/admin/session";
import { adminStoriesQuerySchema } from "@/models/schemas/admin";

const querySchema = adminStoriesQuerySchema.extend({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const authorId = z.string().uuid().parse((await params).id);
    const query = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonOk(await listAdminStories({ ...query, sort: query.sort ?? "newest", authorId }));
  } catch (error) {
    return handleRouteError(error);
  }
}
