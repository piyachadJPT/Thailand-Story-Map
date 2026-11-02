import { z } from "zod";
import { handleRouteError, jsonOk } from "@/api/common/http";
import { userHistory } from "@/api/admin/users";
import { requireAdminSession } from "@/api/admin/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    return jsonOk(await userHistory(z.string().uuid().parse((await params).id)));
  } catch (error) {
    return handleRouteError(error);
  }
}
