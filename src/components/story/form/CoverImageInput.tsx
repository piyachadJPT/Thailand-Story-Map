"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/storage/images";
import type { CoverImage } from "./useCoverImage";

/** รูปปก: preview with remove button, or a dashed drop area to pick a file. */
export default function CoverImageInput({
  image,
  disabled = false,
}: {
  image: CoverImage;
  disabled?: boolean;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        รูปปก (ถ้ามี)
      </label>
      {image.url ? (
        <div className="relative overflow-hidden rounded-2xl bg-muted ring-1 ring-gold/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt="ตัวอย่างรูปปกเรื่องราว"
            className="aspect-video w-full object-cover"
          />
          <IconButton
            size="sm"
            variant="secondary"
            disabled={disabled}
            aria-label="นำรูปปกออก"
            className="absolute top-3 right-3 shadow-soft"
            onClick={() => {
              image.select(null);
              setError("");
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X />
          </IconButton>
        </div>
      ) : null}
      <div className="relative flex items-center gap-3 rounded-2xl border border-dashed border-border p-3 transition-colors focus-within:border-gold hover:border-gold/60">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold-ink"
        >
          <ImagePlus className="size-5" />
        </span>
        <input
          id={id}
          ref={inputRef}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          disabled={disabled}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
          className="w-full min-w-0 text-sm text-muted-foreground outline-none file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:font-medium file:text-secondary-foreground disabled:opacity-50"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!IMAGE_TYPES.includes(file.type) || !file.size || file.size > MAX_IMAGE_BYTES) {
              setError("กรุณาเลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB");
              event.target.value = "";
              return;
            }
            setError("");
            image.select(file);
          }}
        />
      </div>
      <p id={`${id}-help`} className="text-xs text-muted-foreground">
        เลือกไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB
      </p>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
