import { listPendingStories, moderateStory } from "@/api/admin/service";
import { jsonOk, handleRouteError } from "@/api/common/http";
import { ForbiddenError, UnauthorizedError } from "@/api/common/errors";
import { z } from "zod";

const moderateSchema = z.object({
  storyId: z.string().uuid(),
  action: z.enum(["APPROVE", "REJECT"]),
  rejectReason: z.string().min(3).max(500).optional(),
});

export async function GET(request: Request) {
  try {
    assertAdmin(request);
    const pending = await listPendingStories();
    return jsonOk(pending);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertAdmin(request);
    const adminId = requireUserId(request);
    const body = moderateSchema.parse(await request.json());
    if (body.action === "REJECT" && !body.rejectReason) {
      throw new ForbiddenError("rejectReason is required when rejecting");
    }
    const updated = await moderateStory(
      body.storyId,
      body.action,
      adminId,
      body.rejectReason,
    );
    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}

function requireUserId(request: Request) {
  const id = request.headers.get("x-dev-user-id");
  if (!id) throw new UnauthorizedError();
  return id;
}

/** TODO(Phase 1): replace with Auth.js session + UserRole.ADMIN */
function assertAdmin(request: Request) {
  requireUserId(request);
  if (request.headers.get("x-dev-admin") !== "1") {
    throw new ForbiddenError("Admin access required");
  }
}
