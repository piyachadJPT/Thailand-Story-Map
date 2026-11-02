import { handleRouteError, jsonOk } from "@/api/common/http";
import { listAdminUsers } from "@/api/admin/users";
import { requireAdminSession } from "@/api/admin/session";
import { adminUsersQuerySchema } from "@/models/schemas/admin";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const query = adminUsersQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonOk(await listAdminUsers(query));
  } catch (error) {
    return handleRouteError(error);
  }
}
