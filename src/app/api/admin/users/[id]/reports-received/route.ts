import { z } from "zod";
import { handleRouteError, jsonOk } from "@/api/common/http";
import { listUserReports } from "@/api/admin/users";
import { requireAdminSession } from "@/api/admin/session";
import { paginationSchema } from "@/models/schemas/admin";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const id = z.string().uuid().parse((await params).id);
    const { page, pageSize } = paginationSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return jsonOk(await listUserReports(id, "received", page, pageSize));
  } catch (error) {
    return handleRouteError(error);
  }
}
