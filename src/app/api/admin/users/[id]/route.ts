import { z } from "zod";
import { handleRouteError, jsonOk } from "@/api/common/http";
import { assertSameOrigin } from "@/api/common/request";
import { getAdminUser, moderateUser } from "@/api/admin/users";
import { requireAdminSession } from "@/api/admin/session";
import { moderateUserSchema } from "@/models/schemas/admin";
import { revalidateStoriesWhere } from "@/lib/seo/revalidateStories";

type Params = { params: Promise<{ id: string }> };
const idSchema = z.string().uuid("รหัสผู้ใช้ไม่ถูกต้อง");

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminSession();
    return jsonOk(await getAdminUser(idSchema.parse((await params).id)));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { user } = await requireAdminSession();
    assertSameOrigin(request);
    const id = idSchema.parse((await params).id);
    const input = moderateUserSchema.parse(await request.json());
    const result = await moderateUser(id, input, user);
    if (result.hiddenStories > 0) await revalidateStoriesWhere({ authorId: id });
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
