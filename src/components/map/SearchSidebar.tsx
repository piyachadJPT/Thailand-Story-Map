"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { StoryListItem } from "@/models/types/story";
import type { PlaceHit } from "@/components/map/geocode";
import { useMapSheetStore } from "@/components/map/mapSheetStore";

const categories = [
  { name: "เรื่องลี้ลับ", slug: "ghost", icon: "👻" },
  { name: "ประวัติศาสตร์", slug: "history", icon: "🏛" },
  { name: "ตำนานพื้นบ้าน", slug: "legend", icon: "📖" },
  { name: "คดีอาชญากรรม", slug: "crime", icon: "🔪" },
  { name: "เรื่องเล่าท้องถิ่น", slug: "local", icon: "🧭" },
];

type SearchStatus = "idle" | "loading" | "ready" | "error";

export default function SearchSidebar() {
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [places, setPlaces] = useState<PlaceHit[]>([]);
  const [results, setResults] = useState<StoryListItem[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const sheet = useMapSheetStore((state) => state.sheet);
  const openSheet = useMapSheetStore((state) => state.openSheet);
  const closeSheet = useMapSheetStore((state) => state.closeSheet);
  const flyTo = useMapSheetStore((state) => state.flyTo);
  const searchOpen = sheet === "search";
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q && !categorySlug) {
      setPlaces([]);
      setResults([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setStatus("loading");
      let nextStories: StoryListItem[] = [];
      let nextPlaces: PlaceHit[] = [];
      let storiesDone = false;
      let placesDone = false;
      let storiesFailed = false;
      let placesFailed = false;

      const publish = () => {
        if (controller.signal.aborted) return;
        setResults(nextStories);
        setPlaces(nextPlaces);
        if (!storiesDone || !placesDone) {
          if (nextPlaces.length > 0 || nextStories.length > 0) setStatus("ready");
          return;
        }
        const placesSearched = Boolean(q);
        const failed =
          nextStories.length === 0 &&
          nextPlaces.length === 0 &&
          storiesFailed &&
          (!placesSearched || placesFailed);
        setStatus(failed ? "error" : "ready");
      };

      const storiesTask = (async () => {
        const params = new URLSearchParams({ limit: "8" });
        if (q) params.set("q", q);
        if (categorySlug) params.set("categorySlug", categorySlug);
        const response = await fetch(`/api/stories?${params}`, { signal: controller.signal });
        const body = (await response.json()) as { data?: StoryListItem[]; message?: string };
        if (!response.ok) throw new Error(body.message || "ค้นหาไม่สำเร็จ");
        return body.data ?? [];
      })();
      const placesTask = q
        ? (async () => {
            const response = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, {
              signal: controller.signal,
            });
            const body = (await response.json()) as { data?: PlaceHit[]; message?: string };
            if (!response.ok) throw new Error(body.message || "ค้นหาสถานที่ไม่สำเร็จ");
            return body.data ?? [];
          })()
        : Promise.resolve([]);

      storiesTask.then(
        (stories) => {
          nextStories = stories;
          storiesDone = true;
          publish();
        },
        () => {
          if (controller.signal.aborted) return;
          storiesFailed = true;
          storiesDone = true;
          publish();
        },
      );
      placesTask.then(
        (found) => {
          nextPlaces = found;
          placesDone = true;
          publish();
        },
        () => {
          if (controller.signal.aborted) return;
          placesFailed = true;
          placesDone = true;
          publish();
        },
      );
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, categorySlug]);

  useEffect(() => {
    if (!searchOpen) return;
    mobileInputRef.current?.focus();
  }, [searchOpen]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
  }

  function openPlace(place: PlaceHit) {
    flyTo(place.longitude, place.latitude, place.zoom);
    closeSheet();
  }

  function openStory(story: StoryListItem) {
    flyTo(story.longitude, story.latitude, 15);
    closeSheet();
  }

  const searchField = (
    <form onSubmit={onSubmit}>
      <label className="relative block">
        <span className="sr-only">ค้นหาเรื่องเล่า</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ชื่อเรื่อง จังหวัด หรือตำนาน"
          className="h-10 w-full rounded-xl border border-border bg-card/80 pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/25"
        />
      </label>
    </form>
  );

  const categoryChips = (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((category) => {
        const selected = categorySlug === category.slug;
        return (
          <button
            key={category.slug}
            type="button"
            onClick={() => setCategorySlug(selected ? null : category.slug)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/15"
            }`}
            aria-pressed={selected}
          >
            {/* <span className="mr-1" aria-hidden="true">
              {category.icon}
            </span> */}
            {category.name}
          </button>
        );
      })}
    </div>
  );

  const resultList = (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {status === "idle" && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          พิมพ์ชื่อสถานที่ จังหวัด หรือเรื่องเล่า
        </p>
      )}
      {status === "loading" && (
        <p className="text-sm text-muted-foreground">กำลังค้นหา...</p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">ค้นหาไม่สำเร็จ ลองอีกครั้ง</p>
      )}
      {status === "ready" && places.length === 0 && results.length === 0 && (
        <p className="text-sm text-muted-foreground">ไม่พบผลลัพธ์ที่ตรงกับคำค้น</p>
      )}
      {status === "ready" && places.length > 0 && (
        <div className="mb-3">
          <p className="px-3 pb-1 text-xs font-medium text-primary">สถานที่</p>
          <ul className="space-y-1">
            {places.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => openPlace(place)}
                  className="block w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
                >
                  <p className="text-sm font-medium text-foreground">{place.title}</p>
                  {place.subtitle && (
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {place.subtitle}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {status === "ready" && results.length > 0 && (
        <div>
          <p className="px-3 pb-1 text-xs font-medium text-primary">เรื่องเล่า</p>
          <ul className="space-y-1">
            {results.map((story) => (
              <li key={story.id} className="flex items-start gap-1">
                <button
                  type="button"
                  onClick={() => openStory(story)}
                  className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
                >
                  <p className="text-sm font-medium text-foreground">{story.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {story.summary}
                  </p>
                </button>
                <Link
                  href={`/story/${story.provinceSlug}/${story.slug}`}
                  className="mt-2 shrink-0 rounded-full px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  อ่าน
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside
        className="absolute top-4 bottom-4 left-4 z-30 hidden w-[22rem] flex-col rounded-3xl border border-border bg-card/80 p-4 shadow-[0_20px_50px_-24px_rgba(10,15,28,0.16)] backdrop-blur-2xl lg:flex"
        aria-label="ค้นหาเรื่องเล่า"
      >
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-primary">
            สำรวจเรื่องราวบนแผนที่
          </p>
          <h2 className="text-lg font-semibold text-foreground">ค้นหาเรื่องเล่า</h2>
        </div>
        <div className="mt-4">{searchField}</div>
        <div className="mt-3">{categoryChips}</div>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">{resultList}</div>
      </aside>

      {searchOpen && (
        <button
          type="button"
          className="absolute inset-0 z-30 bg-foreground/10 lg:hidden"
          aria-label="ปิดค้นหา"
          onClick={closeSheet}
        />
      )}

      {sheet !== "style" && (
      <div className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-3 lg:hidden">
        {searchOpen ? (
          <div className="animate-slide-up flex max-h-[min(70vh,28rem)] w-full max-w-md flex-col rounded-3xl border border-border bg-card/85 p-3 shadow-[0_16px_40px_-16px_rgba(10,15,28,0.18)] backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">ค้นหาเรื่องเล่า</p>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5"
                aria-label="ปิดค้นหา"
                onClick={closeSheet}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={onSubmit}>
              <label className="relative block">
                <span className="sr-only">ค้นหาเรื่องเล่า</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={mobileInputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ชื่อเรื่อง จังหวัด หรือตำนาน"
                  className="h-10 w-full rounded-xl border border-border bg-card/80 pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/25"
                />
              </label>
            </form>
            <div className="mt-3">{categoryChips}</div>
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto">{resultList}</div>
          </div>
        ) : (
          <button
            type="button"
            className="flex h-12 translate-x-[calc(50%+0.375rem)] items-center gap-2 rounded-full border border-border bg-card/80 px-4 text-sm font-medium text-primary shadow-[0_10px_40px_-16px_rgba(10,15,28,0.16)] backdrop-blur-2xl backdrop-saturate-150"
            aria-label="เปิดค้นหา"
            aria-expanded={false}
            onClick={() => openSheet("search")}
          >
            <Search className="h-4 w-4" />
            ค้นหา
          </button>
        )}
      </div>
      )}
    </>
  );
}
