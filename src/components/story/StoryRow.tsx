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

/**
 * Horizontal, snap-scrolling row of story cards. Edges fade and arrow
 * buttons appear when there is more to scroll. The list itself is
 * focusable so keyboard users can scroll it with the arrow keys.
 */
export default function StoryRow({ stories, label, numbered = false }: StoryRowProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const max = list.scrollWidth - list.clientWidth;
    setEdges({ start: list.scrollLeft > 4, end: list.scrollLeft < max - 4 });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => observer.disconnect();
  }, [update]);

  const scrollBy = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: "smooth" });
  };

  const fade = cn(
    edges.start && edges.end && "[mask-image:linear-gradient(to_right,transparent,black_3rem,black_calc(100%-4rem),transparent)]",
    edges.start && !edges.end && "[mask-image:linear-gradient(to_right,transparent,black_3rem)]",
    !edges.start && edges.end && "[mask-image:linear-gradient(to_right,black_calc(100%-4rem),transparent)]"
  );

  return (
    <div className="relative">
      <ul
        ref={listRef}
        aria-label={label}
        tabIndex={0}
        onScroll={update}
        className={cn(
          "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pb-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:-mx-6 sm:scroll-px-6 sm:px-6",
          fade
        )}
      >
        {stories.map((story, index) => (
          <li key={story.id} className="w-72 shrink-0 snap-start sm:w-80">
            <StoryCard story={story} step={numbered ? index + 1 : undefined} />
          </li>
        ))}
      </ul>

      {/* Pointer users get arrows; touch users swipe. */}
      {edges.start ? (
        <IconButton
          variant="outline"
          aria-label="เลื่อนไปทางซ้าย"
          onClick={() => scrollBy(-1)}
          className="absolute top-1/2 -left-3 hidden -translate-y-1/2 bg-card shadow-lift sm:inline-flex"
        >
          <ChevronLeft />
        </IconButton>
      ) : null}
      {edges.end ? (
        <IconButton
          variant="outline"
          aria-label="เลื่อนไปทางขวา"
          onClick={() => scrollBy(1)}
          className="absolute top-1/2 -right-3 hidden -translate-y-1/2 bg-card shadow-lift sm:inline-flex"
        >
          <ChevronRight />
        </IconButton>
      ) : null}
    </div>
  );
}
