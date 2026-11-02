"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  Check,
  Minus,
  MoreHorizontal,
  Plus,
  Share2,
} from "lucide-react";

export default function StoryReader({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(16);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setCopyError(false);
      setMenuOpen(false);
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
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }
    await copyLink();
  }

  return (
    <section
      ref={sectionRef}
      id="story-content"
      className="liquid-glass mt-6 scroll-mt-28 overflow-hidden rounded-[1.6rem] sm:rounded-[1.85rem]"
      aria-label="เนื้อหาเรื่องราว"
    >
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-6">
        <p className="text-foreground inline-flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="text-gold h-4 w-4" aria-hidden="true" />
          เรื่องราว
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="bg-muted/80 flex items-center gap-0.5 rounded-full p-1"
            role="group"
            aria-label="ปรับขนาดตัวอักษร"
          >
            <span className="text-muted-foreground px-2 text-sm font-medium">
              Aa
            </span>
            <button
              type="button"
              disabled={fontSize <= 14}
              onClick={() => setFontSize((size) => size - 1)}
              className="hover:bg-background focus-visible:outline-primary inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-2 disabled:opacity-30"
              aria-label="ลดขนาดตัวอักษร"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span
              className="text-foreground w-6 text-center text-sm tabular-nums"
              aria-live="polite"
            >
              {fontSize}
            </span>
            <button
              type="button"
              disabled={fontSize >= 22}
              onClick={() => setFontSize((size) => size + 1)}
              className="hover:bg-background focus-visible:outline-primary inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-2 disabled:opacity-30"
              aria-label="เพิ่มขนาดตัวอักษร"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={shareStory}
            className="border-border bg-background hover:bg-muted/60 focus-visible:outline-primary inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-2"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden="true" />
            )}
            <span role="status">{copied ? "คัดลอกแล้ว" : "แชร์เรื่องนี้"}</span>
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="ตัวเลือกเพิ่มเติม"
              onClick={() => setMenuOpen((open) => !open)}
              className="border-border bg-background hover:bg-muted/60 focus-visible:outline-primary inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-2"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="border-border bg-card absolute right-0 z-20 mt-2 min-w-40 rounded-xl border p-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={copyLink}
                  className="hover:bg-muted focus-visible:outline-primary w-full rounded-lg px-3 py-2 text-left text-sm focus-visible:outline-2"
                >
                  คัดลอกลิงก์
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {copyError && (
        <p
          role="status"
          className="text-muted-foreground px-4 pt-3 text-xs sm:px-6"
        >
          คัดลอกไม่ได้ กรุณาคัดลอกลิงก์จากแถบที่อยู่ของเบราว์เซอร์
        </p>
      )}
      <div
        className="story-reader-body text-foreground mx-auto max-w-[76ch] px-5 py-6 sm:px-8 sm:py-10"
        style={{ fontSize }}
      >
        {children}
      </div>
    </section>
  );
}
