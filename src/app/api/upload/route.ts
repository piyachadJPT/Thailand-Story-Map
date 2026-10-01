import { createUploadIntent } from "@/api/upload/service";
import { jsonOk, handleRouteError } from "@/api/common/http";
import { requireUser } from "@/api/auth/session";
import { z } from "zod";

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(3).max(100),
  sizeBytes: z.number().int().min(1).max(5 * 1024 * 1024),
});

export async function POST(request: Request) {
  try {
    await requireUser();
    const body = uploadSchema.parse(await request.json());
    const intent = await createUploadIntent(body);
    return jsonOk(intent);
  } catch (error) {
    return handleRouteError(error);
  }
}
