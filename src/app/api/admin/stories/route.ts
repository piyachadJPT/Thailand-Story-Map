import { listPendingStories, moderateStory } from "@/api/admin/service";
import { jsonOk, handleRouteError } from "@/api/common/http";
import { requireAdmin } from "@/api/auth/session";
import { ForbiddenError } from "@/api/common/errors";
import { z } from "zod";

const moderateSchema = z.object({
  storyId: z.string().uuid(),
  action: z.enum(["APPROVE", "REJECT"]),
  rejectReason: z.string().min(3).max(500).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const pending = await listPendingStories();
    return jsonOk(pending);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = moderateSchema.parse(await request.json());
    if (body.action === "REJECT" && !body.rejectReason) {
      throw new ForbiddenError("rejectReason is required when rejecting");
    }
    const updated = await moderateStory(
      body.storyId,
      body.action,
      admin.id,
      body.rejectReason,
    );
    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}

