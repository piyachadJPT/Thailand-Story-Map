import { handleRouteError, jsonOk } from "@/api/common/http";
import { getOverviewMap } from "@/api/admin/overview";
import { requireAdminSession } from "@/api/admin/session";

export async function GET() {
  try {
    await requireAdminSession();
    return jsonOk(await getOverviewMap());
  } catch (error) {
    return handleRouteError(error);
  }
}
