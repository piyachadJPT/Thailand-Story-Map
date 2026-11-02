"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/storage/images";

export function useCoverImage(initialUrl: string | null = null) {
  const [image, setImage] = useState<{ file: File | null; url: string | null }>(
    { file: null, url: initialUrl }
  );
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
      throw new Error(body.message || "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
    const url = body.data.url as string;
    setImage({ file: null, url });
    return url;
  }
  return { url: image.url, select, upload };
}

export default function CoverImageInput({
  image,
  disabled = false,
}: {
  image: ReturnType<typeof useCoverImage>;
  disabled?: boolean;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-sm font-medium">
        รูปปก (ถ้ามี)
      </label>
      <p id={`${id}-help`} className="text-muted-foreground text-xs">
        เลือกไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB
      </p>
      {image.url && (
        <div className="bg-muted relative overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt="ตัวอย่างรูปปกเรื่องราว"
            className="aspect-video w-full object-cover"
          />
          <button
            type="button"
            disabled={disabled}
            aria-label="นำรูปปกออก"
            onClick={() => {
              image.select(null);
              setError("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="bg-background/90 text-foreground absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full shadow disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="border-border flex items-center gap-3 rounded-xl border p-3">
        <ImagePlus
          className="text-primary h-5 w-5 shrink-0"
          aria-hidden="true"
        />
        <input
          id={id}
          ref={inputRef}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          disabled={disabled}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
          className="file:bg-primary/10 file:text-primary w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-2 disabled:opacity-50"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (
              !IMAGE_TYPES.includes(file.type) ||
              !file.size ||
              file.size > MAX_IMAGE_BYTES
            ) {
              setError("กรุณาเลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB");
              event.target.value = "";
              return;
            }
            setError("");
            image.select(file);
          }}
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
