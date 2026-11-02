"use client";

import { X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { useMapSheetStore } from "./mapSheetStore";
import { MAP_STYLES, type MapStyleId } from "./mapStyles";

type MapStyleSwitcherProps = {
  value: MapStyleId;
  onChange: (id: MapStyleId) => void;
};

const optionClasses = cn(
  "inline-flex items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap outline-none",
  "transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/40",
  "text-foreground hover:bg-foreground/6",
  "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-soft"
);

/** ถนน / ดาวเทียม / เมือง 3D — a pill on desktop, a sheet on mobile. */
export default function MapStyleSwitcher({ value, onChange }: MapStyleSwitcherProps) {
  const sheet = useMapSheetStore((state) => state.sheet);
  const openSheet = useMapSheetStore((state) => state.openSheet);
  const closeSheet = useMapSheetStore((state) => state.closeSheet);
  const open = sheet === "style";
  const active = MAP_STYLES.find((style) => style.id === value) ?? MAP_STYLES[0];
  const ActiveIcon = active.icon;

  const options = (layout: "pill" | "grid") =>
    MAP_STYLES.map((style) => {
      const Icon = style.icon;
      return (
        <button
          key={style.id}
          type="button"
          data-map-style={style.id}
          aria-pressed={value === style.id}
          onClick={() => onChange(style.id)}
          className={cn(
            optionClasses,
            layout === "pill" ? "h-9 px-3.5 text-xs" : "h-12 bg-foreground/4 text-sm"
          )}
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          {style.label}
        </button>
      );
    });

  return (
    <>
      <div
        role="group"
        aria-label="รูปแบบแผนที่"
        hidden={sheet === "composer"}
        className="liquid-glass absolute bottom-5 left-[calc(50%+12rem)] z-20 hidden -translate-x-1/2 gap-0.5 rounded-full p-1 lg:flex"
      >
        {options("pill")}
      </div>

      {open ? (
        <button
          type="button"
          className="absolute inset-0 z-45 bg-background/30 backdrop-blur-[2px] lg:hidden"
          aria-label="ปิดรูปแบบแผนที่"
          onClick={closeSheet}
        />
      ) : null}

      {sheet !== "search" && sheet !== "composer" && (
        <div className="pointer-events-none absolute right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-50 flex justify-end lg:hidden">
          {open ? (
            <section
              aria-label="รูปแบบแผนที่"
              className="liquid-glass pointer-events-auto mx-auto w-full max-w-md rounded-panel p-4 motion-safe:animate-slide-up"
              onKeyDown={(event) => event.key === "Escape" && closeSheet()}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-heading text-base font-semibold text-foreground">
                  รูปแบบแผนที่
                </p>
                <IconButton size="sm" aria-label="ปิดรูปแบบแผนที่" onClick={closeSheet}>
                  <X />
                </IconButton>
              </div>
              <div role="group" aria-label="รูปแบบแผนที่" className="grid grid-cols-3 gap-2">
                {options("grid")}
              </div>
            </section>
          ) : (
            <button
              type="button"
              title={active.label}
              aria-label="เปิดรูปแบบแผนที่"
              aria-expanded={false}
              onClick={() => openSheet("style")}
              className="liquid-glass pointer-events-auto grid size-14 place-items-center rounded-full text-foreground outline-none transition-colors hover:text-gold-ink focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <ActiveIcon aria-hidden="true" className="size-5" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
