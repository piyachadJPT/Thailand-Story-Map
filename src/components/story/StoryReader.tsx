"use client";

import { useRef, useState, type ReactNode } from "react";
import ReadingProgress from "./ReadingProgress";
import ReadingToolbar, { FONT_SIZE } from "./ReadingToolbar";

/**
 * Client shell around the (server-rendered) story body: owns the reader's
 * font size and feeds the progress bar.
 */
export default function StoryReader({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [fontSize, setFontSize] = useState<number>(FONT_SIZE.initial);

  return (
    <section
      ref={sectionRef}
      id="story-content"
      aria-label="เนื้อหาเรื่องราว"
      className="scroll-mt-28 space-y-8"
    >
      <ReadingProgress targetRef={sectionRef} />
      <ReadingToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      <div style={{ fontSize }}>{children}</div>
    </section>
  );
}
