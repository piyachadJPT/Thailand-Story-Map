import { handleRouteError, jsonOk } from "@/api/common/http";
import { getOverview } from "@/api/admin/overview";
import { requireAdminSession } from "@/api/admin/session";
import { overviewRangeSchema } from "@/models/schemas/admin";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { range } = overviewRangeSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonOk(await getOverview(range));
  } catch (error) {
    return handleRouteError(error);
  }
}
