import { handleRouteError, jsonOk } from "@/api/common/http";
import { assertSameOrigin } from "@/api/common/request";
import { changeAdminPassword } from "@/api/admin/account";
import { requireAdminSession } from "@/api/admin/session";
import { adminPasswordChangeSchema } from "@/models/schemas/admin";

export async function POST(request: Request) {
  try {
    const context = await requireAdminSession();
    assertSameOrigin(request);
    const input = adminPasswordChangeSchema.parse(await request.json());
    await changeAdminPassword(context, input);
    return jsonOk({ ok: true }, { message: "เปลี่ยนรหัสผ่านแล้ว" });
  } catch (error) {
    return handleRouteError(error);
  }
}
