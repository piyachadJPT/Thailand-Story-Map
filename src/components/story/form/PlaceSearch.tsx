"use client";

import { useEffect, useState } from "react";
import { MapPin, Search } from "lucide-react";
import type { PlaceHit } from "@/components/map/geocode";
import { inputClass } from "./fieldStyles";

/** Place search with suggestions (/api/geocode). Picking one calls onSelect. */
export default function PlaceSearch({ onSelect }: { onSelect: (place: PlaceHit) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [places, setPlaces] = useState<PlaceHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query.trim();
    const controller = new AbortController();
    const timer = window.setTimeout(
      () => {
        if (q.length < 2 || q === selected) {
          setPlaces([]);
          setError("");
          setSearching(false);
          return;
        }
        setSearching(true);
        setError("");
        void fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { signal: controller.signal })
          .then(async (response) => {
            const body = (await response.json()) as { data?: PlaceHit[]; message?: string };
            if (!response.ok) throw new Error(body.message || "ค้นหาสถานที่ไม่สำเร็จ");
            setPlaces(body.data ?? []);
          })
          .catch((cause: unknown) => {
            if (controller.signal.aborted) return;
            setPlaces([]);
            setError(cause instanceof Error ? cause.message : "ค้นหาสถานที่ไม่สำเร็จ");
          })
          .finally(() => {
            if (!controller.signal.aborted) setSearching(false);
          });
      },
      q.length < 2 || q === selected ? 0 : 300
    );
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, selected]);

  const showList = searching || error || places.length > 0;

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">ค้นหาสถานที่อย่างละเอียด</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-gold-ink"
        />
        <input
          className={`${inputClass} rounded-full pl-11`}
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ค้นหาชื่อสถานที่ ที่อยู่ หรือจุดสังเกต"
        />
      </label>
      {showList ? (
        <div className="mt-2 max-h-44 space-y-1 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card/80 p-1.5">
          {searching ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">กำลังค้นหาสถานที่…</p>
          ) : null}
          {error ? (
            <p role="alert" className="px-2 py-1.5 text-xs text-destructive">
              {error}
            </p>
          ) : null}
          {places.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => {
                setQuery(place.title);
                setSelected(place.title);
                setPlaces([]);
                onSelect(place);
              }}
              className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-ink" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{place.title}</span>
                {place.subtitle ? (
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                    {place.subtitle}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
          {!searching && !error && places.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              ไม่พบสถานที่ ลองระบุชื่อย่านหรือจังหวัดเพิ่ม
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
