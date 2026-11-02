import { handleRouteError, jsonOk } from "@/api/common/http";
import { adminSearch } from "@/api/admin/overview";
import { requireAdminSession } from "@/api/admin/session";
import { adminSearchSchema } from "@/models/schemas/admin";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { q } = adminSearchSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonOk(await adminSearch(q));
  } catch (error) {
    return handleRouteError(error);
  }
}
