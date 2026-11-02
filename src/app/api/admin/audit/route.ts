import { handleRouteError, jsonOk } from "@/api/common/http";
import { listAuditLogs } from "@/api/admin/audit";
import { requireAdminSession } from "@/api/admin/session";
import { adminAuditQuerySchema } from "@/models/schemas/admin";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const query = adminAuditQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonOk(await listAuditLogs(query));
  } catch (error) {
    return handleRouteError(error);
  }
}
