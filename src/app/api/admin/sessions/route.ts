import { handleRouteError, jsonOk } from "@/api/common/http";
import { listAdminSessions } from "@/api/admin/account";
import { requireAdminSession } from "@/api/admin/session";

export async function GET() {
  try {
    const context = await requireAdminSession();
    return jsonOk(await listAdminSessions(context));
  } catch (error) {
    return handleRouteError(error);
  }
}
