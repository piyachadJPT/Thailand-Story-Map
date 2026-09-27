"use client";

import { Map, Compass } from "lucide-react";

/** Phase 2: Mapbox GL map + clustering — placeholder shell */
export default function MapShell() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#f5f7fa] via-white to-[#e8ecf2] dark:from-[#0a0f1c] dark:via-[#0d1424] dark:to-[#141c2f]"
      aria-label="Story map placeholder"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in srgb, var(--foreground) 35%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--foreground) 35%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-6 lg:pr-8 lg:pl-[26rem]">
        <div className="max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Map className="h-8 w-8" />
          </div>
          <p className="text-lg font-semibold text-foreground">แผนที่เรื่องเล่า</p>
          <p className="text-sm text-muted-foreground">
            Mapbox + clustering กำลังมาเร็ว ๆ นี้
          </p>
          <div className="mx-auto inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-xs font-medium text-primary">
            <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "4s" }} />
            Phase 2 — กำลังพัฒนา
          </div>
        </div>
      </div>
    </div>
  );
}
