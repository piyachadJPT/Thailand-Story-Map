import { z } from "zod";
import { handleRouteError, jsonOk } from "@/api/common/http";
import { assertSameOrigin } from "@/api/common/request";
import { getAdminStory, moderateStory } from "@/api/admin/stories";
import { requireAdminSession } from "@/api/admin/session";
import { moderateStorySchema } from "@/models/schemas/admin";

type Params = { params: Promise<{ id: string }> };
const idSchema = z.string().uuid("รหัสเรื่องไม่ถูกต้อง");

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminSession();
    const id = idSchema.parse((await params).id);
    return jsonOk(await getAdminStory(id));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { user } = await requireAdminSession();
    assertSameOrigin(request);
    const id = idSchema.parse((await params).id);
    const input = moderateStorySchema.parse(await request.json());
    return jsonOk(await moderateStory(id, input, user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
