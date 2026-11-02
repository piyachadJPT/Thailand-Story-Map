"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "../format";

/** Counts up to `value` once, on first load (≤600ms); instant with reduced motion. */
export default function CountUp({ value, format = formatNumber }: { value: number; format?: (n: number) => string }) {
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced || value === 0 ? 0 : 600;
    const start = performance.now();
    let frame = requestAnimationFrame(function step(time) {
      const progress = duration ? Math.min(1, (time - start) / duration) : 1;
      setShown(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
      else setDone(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [value, done]);

  return <>{format(done ? value : shown)}</>;
}
