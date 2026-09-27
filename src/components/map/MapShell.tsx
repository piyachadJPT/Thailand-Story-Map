"use client";

import { Map, Compass } from "lucide-react";

/** Phase 2: Mapbox GL map + clustering — placeholder shell */
export default function MapShell() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-gradient-to-br from-violet-50 via-white to-rose-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950"
      aria-label="Story map placeholder"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(109,40,217,0.55) 1px, transparent 1px),
            linear-gradient(90deg, rgba(109,40,217,0.55) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-6 lg:pr-8 lg:pl-[26rem]">
        <div className="max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-teal-500 text-white shadow-lg shadow-violet-500/20">
            <Map className="h-8 w-8" />
          </div>
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">แผนที่เรื่องเล่า</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Mapbox + clustering กำลังมาเร็ว ๆ นี้
          </p>
          <div className="mx-auto inline-flex items-center justify-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-medium text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-violet-200">
            <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "4s" }} />
            Phase 2 — กำลังพัฒนา
          </div>
        </div>
      </div>
    </div>
  );
}
