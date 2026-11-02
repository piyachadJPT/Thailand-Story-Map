"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Hides the header while scrolling down (past 80px) and shows it again on
 * scroll up. Never hides while focus is inside the header.
 * Returns true when the header should be hidden on this path.
 */
export function useHideOnScroll(
  enabled: boolean,
  pathname: string,
  headerRef: RefObject<HTMLElement | null>
) {
  const [hiddenOnPath, setHiddenOnPath] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let previousY = Math.max(0, window.scrollY);
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const currentY = Math.max(0, window.scrollY);
        const delta = currentY - previousY;
        if (currentY <= 80) {
          setHiddenOnPath(null);
          previousY = currentY;
          return;
        }
        // Ignore tiny movements so touch scrolling does not flicker the navbar.
        if (Math.abs(delta) < 6) return;
        const hasFocus = headerRef.current?.contains(document.activeElement);
        setHiddenOnPath(delta > 0 && !hasFocus ? pathname : null);
        previousY = currentY;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [enabled, pathname, headerRef]);

  return enabled && hiddenOnPath === pathname;
}
