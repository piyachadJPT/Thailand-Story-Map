import { createReport } from "@/api/reports/service";
import { jsonOk, handleRouteError } from "@/api/common/http";
import { getSessionUser } from "@/api/auth/session";
import { ForbiddenError } from "@/api/common/errors";
import { enforceRateLimit } from "@/api/common/ratelimit";
import { getClientIp } from "@/api/common/request";
import { createReportSchema } from "@/models/schemas";
import { UserStatus } from "@/models/enums";

export async function POST(request: Request) {
  try {
    const reporter = await getSessionUser();
    if (reporter?.status === UserStatus.BANNED) throw new ForbiddenError("บัญชีนี้ถูกระงับการใช้งาน");
    await enforceRateLimit("report", reporter?.id ?? `ip:${getClientIp(request)}`);
    const body = createReportSchema.parse(await request.json());
    const report = await createReport(body, reporter?.id);
    return jsonOk(report, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
