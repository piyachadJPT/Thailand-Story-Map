import { uploadStoryCover } from "@/api/upload/service";
import { jsonOk, handleRouteError } from "@/api/common/http";
import { requireUser } from "@/api/auth/session";
import { ApiError } from "@/api/common/errors";
import { MAX_IMAGE_BYTES } from "@/lib/storage/images";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
      throw new ApiError("กรุณาส่งไฟล์รูปภาพ");
    const length = Number(request.headers.get("content-length"));
    if (length > MAX_IMAGE_BYTES + 64 * 1024)
      throw new ApiError("รูปต้องมีขนาดไม่เกิน 5 MB", 413);
    const body = await request.formData();
    const file = body.get("file");
    if (!(file instanceof File)) throw new ApiError("กรุณาเลือกไฟล์รูปภาพ");
    return jsonOk(await uploadStoryCover(file, user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
