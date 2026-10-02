"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Minus, Plus, Type } from "lucide-react";

export default function StoryReader({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const distance = Math.max(1, rect.height - window.innerHeight + 120);
        const progress = Math.min(1, Math.max(0, (120 - rect.top) / distance));
        if (progressRef.current)
          progressRef.current.style.transform = `scaleX(${progress})`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
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
      ref={sectionRef}
      id="story-content"
      className="liquid-glass scroll-mt-28 overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem]"
      aria-label="เนื้อหาเรื่องราว"
    >
      <div aria-hidden="true" className="bg-primary/10 h-1">
        <div
          ref={progressRef}
          className="bg-gold h-full origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
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
        className="story-reader-body text-foreground mx-auto max-w-[72ch] px-6 py-8 sm:px-10 sm:py-12"
        style={{ fontSize }}
      >
        {children}
      </div>
    </section>
  );
}
