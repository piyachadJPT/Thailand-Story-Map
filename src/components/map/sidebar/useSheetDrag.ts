"use client";

import { useRef, useState, type PointerEvent } from "react";

const THRESHOLD = 48;

/**
 * Vertical drag on a sheet handle. While dragging down, `offset` follows the
 * finger; on release past the threshold it calls onSwipe("up" | "down").
 * Taps and keyboard presses (Enter/Space) call onTap via onClick.
 */
export function useSheetDrag({
  onSwipe,
  onTap,
}: {
  onSwipe: (direction: "up" | "down") => void;
  onTap: () => void;
}) {
  const start = useRef<number | null>(null);
  const moved = useRef(false);
  const [offset, setOffset] = useState(0);

  return {
    offset,
    handlers: {
      onPointerDown(event: PointerEvent<HTMLElement>) {
        start.current = event.clientY;
        moved.current = false;
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove(event: PointerEvent<HTMLElement>) {
        if (start.current === null) return;
        const delta = event.clientY - start.current;
        if (Math.abs(delta) >= 6) moved.current = true;
        setOffset(Math.max(0, delta));
      },
      onPointerUp(event: PointerEvent<HTMLElement>) {
        if (start.current === null) return;
        const delta = event.clientY - start.current;
        start.current = null;
        setOffset(0);
        if (delta <= -THRESHOLD) onSwipe("up");
        else if (delta >= THRESHOLD) onSwipe("down");
      },
      onPointerCancel() {
        start.current = null;
        setOffset(0);
      },
      onClick() {
        // The click that follows a drag is not a tap.
        if (moved.current) {
          moved.current = false;
          return;
        }
        onTap();
      },
    },
  };
}
