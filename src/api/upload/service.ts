import { ApiError } from "@/api/common/errors";

/** Phase 3: presigned URL flow for Cloudflare R2 */
export async function createUploadIntent(_input: {
  filename: string;
  contentType: string;
  sizeBytes: number;
}) {
  throw new ApiError("Image upload is not configured yet (R2)", 501, "NOT_IMPLEMENTED");
}
