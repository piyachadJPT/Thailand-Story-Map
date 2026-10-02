"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, Minus, Plus, Type } from "lucide-react";

export default function StoryReader({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState(18);
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

  return (
    <section
      id="story-content"
      className="border-border bg-card/90 scroll-mt-24 overflow-hidden rounded-[1.5rem] border shadow-[0_8px_32px_-24px_rgba(0,0,0,0.18)] sm:rounded-[1.75rem]"
      aria-label="เนื้อหาเรื่องราว"
    >
      <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3 sm:px-8">
        <div
          className="flex items-center gap-2"
          role="group"
          aria-label="ปรับขนาดตัวอักษร"
        >
          <Type className="text-muted-foreground h-4 w-4" aria-hidden="true" />
          <span className="text-muted-foreground text-[11px]">ตัวอักษร</span>
          <div className="bg-card/80 border-border flex items-center gap-1 rounded-full border p-1">
            <button
              type="button"
              disabled={fontSize <= 16}
              onClick={() => setFontSize((size) => size - 2)}
              className="hover:bg-background focus-visible:outline-primary inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 disabled:opacity-30"
              aria-label="ลดขนาดตัวอักษร"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span
              className="text-foreground w-6 text-center text-xs tabular-nums"
              aria-live="polite"
            >
              {fontSize}
            </span>
            <button
              type="button"
              disabled={fontSize >= 24}
              onClick={() => setFontSize((size) => size + 2)}
              className="hover:bg-background focus-visible:outline-primary inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 disabled:opacity-30"
              aria-label="เพิ่มขนาดตัวอักษร"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="text-primary hover:bg-primary/10 focus-visible:outline-primary inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[11px] font-medium transition-colors focus-visible:outline-2"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span role="status">{copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}</span>
        </button>
      </div>
      {copyError && (
        <p
          role="status"
          className="text-muted-foreground px-5 pt-3 text-xs sm:px-8"
        >
          คัดลอกไม่ได้ กรุณาคัดลอกลิงก์จากแถบที่อยู่ของเบราว์เซอร์
        </p>
      )}
      <div
        className="story-reader-body text-foreground px-6 py-8 sm:px-10 sm:py-12"
        style={{ fontSize }}
      >
        {children}
      </div>
    </section>
  );
}
