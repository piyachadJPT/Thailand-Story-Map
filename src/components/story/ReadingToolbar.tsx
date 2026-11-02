"use client";

import { useState } from "react";
import { BookOpen, Check, Link2, Minus, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

export const FONT_SIZE = { min: 14, max: 22, initial: 16 } as const;

type ReadingToolbarProps = {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
};

/**
 * Sticky bar below the floating navbar: text size −/+, share (falls back to
 * copy), copy link. Mostly opaque so the story text never shows through.
 */
export default function ReadingToolbar({ fontSize, onFontSizeChange }: ReadingToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  }

  async function shareStory() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyLink();
  }

  return (
    <div className="sticky top-22 z-20 mx-auto max-w-170">
      <div className="flex items-center justify-between gap-2 rounded-full border border-border bg-card/90 p-1.5 pl-4 shadow-soft backdrop-blur-xl">
        <p className="hidden items-center gap-2 text-sm font-semibold text-foreground sm:inline-flex">
          <BookOpen aria-hidden="true" className="size-4 text-gold-ink" />
          เรื่องราว
        </p>
        <div className="flex items-center gap-1" role="group" aria-label="ปรับขนาดตัวอักษร">
          <span aria-hidden="true" className="px-1 text-sm font-medium text-muted-foreground">
            Aa
          </span>
          <IconButton
            size="sm"
            aria-label="ลดขนาดตัวอักษร"
            disabled={fontSize <= FONT_SIZE.min}
            onClick={() => onFontSizeChange(fontSize - 1)}
          >
            <Minus />
          </IconButton>
          <span aria-live="polite" className="w-6 text-center text-sm text-foreground tabular-nums">
            {fontSize}
          </span>
          <IconButton
            size="sm"
            aria-label="เพิ่มขนาดตัวอักษร"
            disabled={fontSize >= FONT_SIZE.max}
            onClick={() => onFontSizeChange(fontSize + 1)}
          >
            <Plus />
          </IconButton>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="secondary" onClick={shareStory}>
            {copied ? <Check aria-hidden="true" className="text-success" /> : <Share2 aria-hidden="true" />}
            <span role="status" className="max-sm:sr-only">
              {copied ? "คัดลอกแล้ว" : "แชร์เรื่องนี้"}
            </span>
          </Button>
          <IconButton size="sm" aria-label="คัดลอกลิงก์" onClick={copyLink}>
            <Link2 />
          </IconButton>
        </div>
      </div>
      {copyError ? (
        <p role="status" className="mt-2 px-4 text-xs text-muted-foreground">
          คัดลอกไม่ได้ กรุณาคัดลอกลิงก์จากแถบที่อยู่ของเบราว์เซอร์
        </p>
      ) : null}
    </div>
  );
}
