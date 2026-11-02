import { handleRouteError, jsonOk } from "@/api/common/http";
import { listReportGroups } from "@/api/admin/reports";
import { requireAdminSession } from "@/api/admin/session";
import { adminReportsQuerySchema } from "@/models/schemas/admin";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const query = adminReportsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonOk(await listReportGroups(query));
  } catch (error) {
    return handleRouteError(error);
  }
}
