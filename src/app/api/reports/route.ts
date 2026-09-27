import { createReport } from "@/api/reports/service";
import { jsonOk, handleRouteError } from "@/api/common/http";
import { createReportSchema } from "@/models/schemas";

export async function POST(request: Request) {
  try {
    const body = createReportSchema.parse(await request.json());
    const reporterId = request.headers.get("x-dev-user-id") ?? undefined;
    const report = await createReport(body, reporterId);
    return jsonOk(report, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
