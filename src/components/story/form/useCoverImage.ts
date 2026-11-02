"use client";

import { useEffect, useState } from "react";
import { responseErrorMessage } from "@/utils/errorHandler";

/** Selected cover image (local preview) and its upload to /api/upload. */
export function useCoverImage(initialUrl: string | null = null) {
  const [image, setImage] = useState<{ file: File | null; url: string | null }>({
    file: null,
    url: initialUrl,
  });
  useEffect(
    () => () => {
      if (image.url?.startsWith("blob:")) URL.revokeObjectURL(image.url);
    },
    [image.url]
  );

  function select(file: File | null) {
    setImage({ file, url: file ? URL.createObjectURL(file) : null });
  }
  async function upload() {
    if (!image.file) return image.url;
    const form = new FormData();
    form.append("file", image.file);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const body = await response.json();
    if (!response.ok || !body.success || !body.data?.url)
      throw new Error(responseErrorMessage(response, body, "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่"));
    const url = body.data.url as string;
    setImage({ file: null, url });
    return url;
  }
  return { url: image.url, select, upload };
}

export type CoverImage = ReturnType<typeof useCoverImage>;
