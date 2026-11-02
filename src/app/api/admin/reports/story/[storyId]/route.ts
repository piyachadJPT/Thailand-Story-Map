import { z } from "zod";
import { handleRouteError, jsonOk } from "@/api/common/http";
import { assertSameOrigin } from "@/api/common/request";
import { resolveStoryReports } from "@/api/admin/reports";
import { requireAdminSession } from "@/api/admin/session";
import { resolveReportsSchema } from "@/models/schemas/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ storyId: string }> }) {
  try {
    const { user } = await requireAdminSession();
    assertSameOrigin(request);
    const storyId = z.string().uuid().parse((await params).storyId);
    const input = resolveReportsSchema.parse(await request.json());
    return jsonOk(await resolveStoryReports(storyId, input, user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
