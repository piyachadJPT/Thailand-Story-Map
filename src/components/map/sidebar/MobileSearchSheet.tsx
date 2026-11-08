"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { useMapSheetStore } from "../mapSheetStore";
import SearchPanel from "./SearchPanel";
import type { StorySearch } from "./useStorySearch";
import { useSheetDrag } from "./useSheetDrag";

type Snap = "half" | "full";

/**
 * Below lg the search lives in a bottom sheet with three heights:
 * peek (closed, sheet !== "search"), half and full.
 */
export default function MobileSearchSheet({ search }: { search: StorySearch }) {
  const sheet = useMapSheetStore((state) => state.sheet);
  const openSheet = useMapSheetStore((state) => state.openSheet);
  const closeSheet = useMapSheetStore((state) => state.closeSheet);
  const [snap, setSnap] = useState<Snap>("half");
  const inputRef = useRef<HTMLInputElement>(null);
  const open = sheet === "search";

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const openAt = (next: Snap) => {
    setSnap(next);
    openSheet("search");
  };
  const peekDrag = useSheetDrag({
    onSwipe: (direction) => direction === "up" && openAt("half"),
    onTap: () => openAt("half"),
  });
  const handleDrag = useSheetDrag({
    onSwipe: (direction) => {
      if (direction === "up") setSnap("full");
      else if (snap === "full") setSnap("half");
      else closeSheet();
    },
    onTap: () => setSnap(snap === "half" ? "full" : "half"),
  });

  if (sheet === "style" || sheet === "composer") return null;

  if (!open) {
    return (
      <button
        type="button"
        aria-label="เปิดค้นหา"
        aria-expanded={false}
        {...peekDrag.handlers}
        className="liquid-glass absolute right-20 bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-40 flex h-14 touch-none items-center gap-3 rounded-panel pr-4 pl-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40 lg:hidden"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-control bg-primary text-primary-foreground">
          <Search aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">ค้นหา</span>
          <span className="block truncate text-xs text-muted-foreground">
            ค้นหาสถานที่ หรือเรื่องราวที่อยากอ่าน
          </span>
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-30 bg-nav/30 lg:hidden"
        aria-label="ปิดค้นหา"
        onClick={closeSheet}
      />
      <section
        aria-label="ค้นหาสถานที่และเรื่องราว"
        onKeyDown={(event) => event.key === "Escape" && closeSheet()}
        style={handleDrag.offset ? { transform: `translateY(${handleDrag.offset}px)` } : undefined}
        className={cn(
          "liquid-glass absolute inset-x-0 bottom-0 z-40 mx-auto flex max-w-xl flex-col rounded-t-panel px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden",
          "transition-[height] duration-300 ease-out motion-safe:animate-slide-up motion-reduce:transition-none",
          snap === "half" ? "h-[60dvh]" : "h-[calc(100dvh-6rem)]"
        )}
      >
        <button
          type="button"
          aria-label={snap === "half" ? "ขยายแผงค้นหา" : "ย่อแผงค้นหา"}
          {...handleDrag.handlers}
          className="mx-auto flex h-7 w-24 touch-none items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-foreground/25" />
        </button>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-heading text-base font-bold text-foreground">
            ค้นหาสถานที่และเรื่องราว
          </h2>
          <IconButton size="sm" aria-label="ปิดค้นหา" onClick={closeSheet}>
            <X />
          </IconButton>
        </div>
        <SearchPanel search={search} inputRef={inputRef} className="min-h-0" />
      </section>
    </>
  );
}
