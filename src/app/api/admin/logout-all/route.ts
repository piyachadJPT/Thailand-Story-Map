import { handleRouteError, jsonOk } from "@/api/common/http";
import { assertSameOrigin } from "@/api/common/request";
import { logoutOtherSessions } from "@/api/admin/account";
import { requireAdminSession } from "@/api/admin/session";

export async function POST(request: Request) {
  try {
    const context = await requireAdminSession();
    assertSameOrigin(request);
    return jsonOk(await logoutOtherSessions(context));
  } catch (error) {
    return handleRouteError(error);
  }
}
