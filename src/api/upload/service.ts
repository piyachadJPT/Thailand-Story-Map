import { randomUUID } from "node:crypto";
import { ApiError, ForbiddenError } from "@/api/common/errors";
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";
import { getSupabaseUrl } from "@/config/supabase-env";
import {
  COVER_BUCKET,
  MAX_IMAGE_BYTES,
  IMAGE_TYPES,
  detectImageType,
  ownedCoverPath,
} from "@/lib/storage/images";

function storageClient() {
  if (!isSupabaseAdminConfigured())
    throw new ApiError(
      "ระบบอัปโหลดรูปยังไม่พร้อม กรุณาติดต่อผู้ดูแล",
      503,
      "STORAGE_NOT_CONFIGURED"
    );
  return createSupabaseAdminClient();
}

export async function uploadStoryCover(file: File, authorId: string) {
  if (!file.size || file.size > MAX_IMAGE_BYTES)
    throw new ApiError("รูปต้องมีขนาดไม่เกิน 5 MB");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = detectImageType(bytes);
  if (!contentType || contentType !== file.type)
    throw new ApiError("กรุณาเลือกรูป JPG, PNG หรือ WebP ที่ถูกต้อง");
  const client = storageClient();
  let result = await client.storage.getBucket(COVER_BUCKET);
  if (
    result.error &&
    result.error.message.toLowerCase().includes("not found")
  ) {
    await client.storage.createBucket(COVER_BUCKET, {
      public: true,
      fileSizeLimit: MAX_IMAGE_BYTES,
      allowedMimeTypes: IMAGE_TYPES,
    });
    result = await client.storage.getBucket(COVER_BUCKET);
  }
  if (result.error || !result.data?.public)
    throw new ApiError("พื้นที่เก็บรูปยังไม่พร้อม กรุณาติดต่อผู้ดูแล", 503);
  const extension =
    contentType === "image/jpeg"
      ? "jpg"
      : contentType === "image/png"
        ? "png"
        : "webp";
  const path = `${authorId}/${randomUUID()}.${extension}`;
  const { error } = await client.storage
    .from(COVER_BUCKET)
    .upload(path, bytes, {
      contentType,
      upsert: false,
      cacheControl: "31536000",
    });
  if (error) throw new ApiError("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่", 502);
  return {
    url: client.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl,
  };
}

export async function validateOwnedCover(url: string, authorId: string) {
  const path = ownedCoverPath(url, getSupabaseUrl() ?? "", authorId);
  if (!path) throw new ForbiddenError("กรุณาใช้รูปที่คุณอัปโหลดเอง");
  const { data, error } = await storageClient()
    .storage.from(COVER_BUCKET)
    .exists(path);
  if (error) throw new ApiError("ตรวจสอบรูปไม่สำเร็จ กรุณาลองใหม่", 502);
  if (!data) throw new ApiError("ไม่พบรูปที่อัปโหลด กรุณาเลือกรูปใหม่");
}
