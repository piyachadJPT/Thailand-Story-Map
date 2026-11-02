import { handleRouteError, jsonOk } from "@/api/common/http";
import { getSidebarCounts } from "@/api/admin/overview";
import { requireAdminSession } from "@/api/admin/session";

export async function GET() {
  try {
    await requireAdminSession();
    return jsonOk(await getSidebarCounts());
  } catch (error) {
    return handleRouteError(error);
  }
}
