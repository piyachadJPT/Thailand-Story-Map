"use client";

import { useEffect, useState, type RefObject } from "react";

/** Thin gold bar at the top of the viewport: how far through the story you are. */
export default function ReadingProgress({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const target = targetRef.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const read = total > 0 ? -rect.top / total : rect.top < 0 ? 1 : 0;
      setProgress(Math.min(1, Math.max(0, read)));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [targetRef]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-60 h-1">
      <div
        className="h-full origin-left bg-linear-to-r from-gold/70 to-gold"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
