import { createReport } from "@/api/reports/service";
import { jsonOk, handleRouteError } from "@/api/common/http";
import { getSessionUser } from "@/api/auth/session";
import { createReportSchema } from "@/models/schemas";

export async function POST(request: Request) {
  try {
    const body = createReportSchema.parse(await request.json());
    const reporter = await getSessionUser();
    const report = await createReport(body, reporter?.id);
    return jsonOk(report, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
