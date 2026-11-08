"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StoryListItem } from "@/models/types/story";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import StoryCard from "./StoryCard";

type StoryRowProps = {
  stories: StoryListItem[];
  label: string;
  /** Number the cards (a route to follow in order). */
  numbered?: boolean;
};

type Layout = {
  /** Positions that put a card at the start edge (one dot each). */
  stops: number;
  /** Distance between two cards (card width + gap), in px. */
  step: number;
  /** How far the track can move, in px. */
  max: number;
};

const SWIPE_PX = 40;

/**
 * Row of story cards that slides with a transform instead of scrolling, so no
 * browser ever draws a scrollbar. Move with the dots, the arrows, a swipe, or
 * the arrow keys; focusing a card brings it into view.
 */
export default function StoryRow({ stories, label, numbered = false }: StoryRowProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const touchX = useRef<number | null>(null);
  const [layout, setLayout] = useState<Layout>({ stops: 1, step: 0, max: 0 });
  const [active, setActive] = useState(0);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const items = track?.children;
    if (!viewport || !track || !items || items.length === 0) return;
    // Measure from the last card (not the track's own width) so every browser agrees.
    const last = items[items.length - 1] as HTMLElement;
    const padEnd = parseFloat(getComputedStyle(track).paddingRight) || 0;
    const contentWidth = last.offsetLeft + last.offsetWidth + padEnd;
    const max = Math.max(0, contentWidth - viewport.clientWidth);
    const step =
      items.length > 1
        ? (items[1] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft
        : viewport.clientWidth;
    const stops = step > 0 && max > 4 ? Math.ceil(max / step) + 1 : 1;
    setLayout({ stops, step, max });
    setActive((current) => Math.min(current, stops - 1));
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure]);

  const go = (index: number) => setActive(Math.max(0, Math.min(layout.stops - 1, index)));
  const offset = Math.min(active * layout.step, layout.max);
  const atStart = active === 0;
  const atEnd = active >= layout.stops - 1;

  const fade = cn(
    !atStart && !atEnd && "[mask-image:linear-gradient(to_right,transparent,black_3rem,black_calc(100%-4rem),transparent)]",
    !atStart && atEnd && "[mask-image:linear-gradient(to_right,transparent,black_3rem)]",
    atStart && !atEnd && "[mask-image:linear-gradient(to_right,black_calc(100%-4rem),transparent)]"
  );

  return (
    <div>
      <div className="relative">
        <div
          ref={viewportRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={label}
          tabIndex={0}
          className={cn(
            "-mx-4 touch-pan-y overflow-hidden outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:-mx-6",
            fade
          )}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") go(active + 1);
            else if (event.key === "ArrowLeft") go(active - 1);
            else return;
            event.preventDefault();
          }}
          onTouchStart={(event) => {
            touchX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const start = touchX.current;
            touchX.current = null;
            const end = event.changedTouches[0]?.clientX;
            if (start == null || end == null) return;
            if (start - end > SWIPE_PX) go(active + 1);
            else if (end - start > SWIPE_PX) go(active - 1);
          }}
          onFocus={(event) => {
            // Tabbing to a hidden card: slide it into view, and undo the
            // browser's own scroll of this clipped box.
            event.currentTarget.scrollLeft = 0;
            const item = (event.target as HTMLElement).closest("li");
            if (!item || !trackRef.current) return;
            const index = Array.prototype.indexOf.call(trackRef.current.children, item);
            if (index >= 0) go(index);
          }}
        >
          <ul
            ref={trackRef}
            className="flex w-max gap-4 px-4 pt-1 pb-4 transition-transform duration-500 ease-out motion-reduce:transition-none sm:px-6"
            style={{ transform: `translateX(-${offset}px)` }}
          >
            {stories.map((story, index) => (
              <li key={story.id} className="w-72 shrink-0 sm:w-80">
                <StoryCard story={story} step={numbered ? index + 1 : undefined} />
              </li>
            ))}
          </ul>
        </div>

        {/* Pointer users get arrows; touch users swipe. */}
        {!atStart ? (
          <IconButton
            variant="outline"
            aria-label="เลื่อนไปทางซ้าย"
            onClick={() => go(active - 1)}
            className="absolute top-1/2 -left-3 hidden -translate-y-1/2 bg-card sm:inline-flex"
          >
            <ChevronLeft />
          </IconButton>
        ) : null}
        {!atEnd ? (
          <IconButton
            variant="outline"
            aria-label="เลื่อนไปทางขวา"
            onClick={() => go(active + 1)}
            className="absolute top-1/2 -right-3 hidden -translate-y-1/2 bg-card sm:inline-flex"
          >
            <ChevronRight />
          </IconButton>
        ) : null}
      </div>

      {layout.stops > 1 ? (
        <div className="mt-1 flex justify-center gap-1.5" role="group" aria-label={`ตำแหน่งใน ${label}`}>
          {Array.from({ length: layout.stops }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => go(index)}
              aria-label={`ไปที่ตำแหน่ง ${index + 1} จาก ${layout.stops}`}
              aria-current={index === active ? "true" : undefined}
              // Small visible dot inside a larger tap target.
              className="group/dot flex h-6 items-center justify-center px-0.5 outline-none"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-[width,opacity] duration-300 group-focus-visible/dot:ring-3 group-focus-visible/dot:ring-ring/40 motion-reduce:transition-none",
                  index === active
                    ? "w-5 bg-gold"
                    : "w-1.5 bg-muted-foreground opacity-50 group-hover/dot:opacity-90"
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
