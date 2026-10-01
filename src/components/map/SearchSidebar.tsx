"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { StoryListItem } from "@/models/types/story";
import type { PlaceHit } from "@/components/map/geocode";
import { useMapSheetStore } from "@/components/map/mapSheetStore";
import { categoryIcon, storyCategories } from "@/config/categories";
import { cn } from "@/lib/utils";

type SearchStatus = "idle" | "loading" | "ready" | "error";

const traceCard =
  "rounded-2xl border border-dashed border-foreground/12 px-3 py-2.5";

function ResultTraces({ pulse = false }: { pulse?: boolean }) {
  return (
    <div className={cn("space-y-4", pulse && "animate-pulse")} aria-hidden>
      <div>
        <div className="mb-2 h-2 w-14 rounded-full bg-primary/25" />
        <div className="space-y-2">
          {[0, 1].map((item) => (
            <div key={`place-${item}`} className={traceCard}>
              <div className="h-3.5 w-2/3 rounded-full bg-foreground/8" />
              <div className="mt-2 h-2.5 w-full rounded-full bg-foreground/5" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 h-2 w-16 rounded-full bg-primary/25" />
        <div className="space-y-2">
          {[0, 1, 2].map((item) => (
            <div key={`story-${item}`} className="flex items-start gap-1">
              <div className={cn("min-w-0 flex-1", traceCard)}>
                <div className="h-3.5 w-2/3 rounded-full bg-foreground/8" />
                <div className="mt-2 h-2.5 w-full rounded-full bg-foreground/5" />
                <div className="mt-1.5 h-2.5 w-4/5 rounded-full bg-foreground/5" />
              </div>
              <div className="mt-2 h-6 w-10 shrink-0 rounded-full border border-dashed border-primary/30" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ชื่อเรื่อง จังหวัด หรือตำนาน"
          className="liquid-field h-11 w-full rounded-2xl pr-3 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>
    </form>
  );

  const categoryChips = (
    <div className="flex flex-wrap gap-1.5">
      {storyCategories.map((category) => {
        const selected = categorySlug === category.slug;
        const Icon = categoryIcon(category.slug);
        return (
          <button
            key={category.slug}
            type="button"
            onClick={() => setCategorySlug(selected ? null : category.slug)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200",
              selected
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                : "bg-foreground/5 text-foreground hover:bg-foreground/10",
            )}
            aria-pressed={selected}
          >
            <Icon className="h-3 w-3 shrink-0 opacity-80" />
            {category.name}
          </button>
        );
      })}
    </div>
  );

  const resultList = (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {(status === "idle" ||
        status === "loading" ||
        (status === "ready" && places.length === 0 && results.length === 0)) && (
        <ResultTraces pulse={status === "loading"} />
      )}
      {status === "error" && (
        <div className={cn(traceCard, "text-sm text-destructive")}>ค้นหาไม่สำเร็จ ลองอีกครั้ง</div>
      )}
      {status === "ready" && places.length > 0 && (
        <div className="mb-4">
          <p className="px-1 pb-2 text-[0.68rem] font-semibold tracking-[0.16em] text-primary uppercase">
            สถานที่
          </p>
          <ul className="space-y-2">
            {places.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => openPlace(place)}
                  className={cn(traceCard, "block w-full text-left transition-colors hover:bg-primary/8")}
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
          <p className="px-1 pb-2 text-[0.68rem] font-semibold tracking-[0.16em] text-primary uppercase">
            เรื่องเล่า
          </p>
          <ul className="space-y-2">
            {results.map((story) => (
              <li key={story.id} className="flex items-start gap-1">
                <button
                  type="button"
                  onClick={() => openStory(story)}
                  className={cn(
                    traceCard,
                    "min-w-0 flex-1 text-left transition-colors hover:bg-primary/8",
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{story.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {story.summary}
                  </p>
                </button>
                <Link
                  href={`/story/${story.provinceSlug}/${story.slug}`}
                  className="mt-2 shrink-0 rounded-full border border-dashed border-primary/35 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
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
        className="liquid-glass absolute top-4 bottom-4 left-4 z-30 hidden w-[22rem] flex-col rounded-[1.85rem] p-5 lg:flex"
        aria-label="ค้นหาเรื่องเล่า"
      >
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-primary uppercase">
            สำรวจเรื่องราวบนแผนที่
          </p>
          <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            ค้นหาเรื่องเล่า
          </h2>
        </div>
        <div className="mt-5">{searchField}</div>
        <div className="mt-3.5">{categoryChips}</div>
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto">{resultList}</div>
      </aside>

      {searchOpen && (
        <button
          type="button"
          className="absolute inset-0 z-30 bg-foreground/15 backdrop-blur-[2px] lg:hidden"
          aria-label="ปิดค้นหา"
          onClick={closeSheet}
        />
      )}

      {sheet !== "style" && (
        <div className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-3 lg:hidden">
          {searchOpen ? (
            <div className="liquid-glass animate-slide-up flex max-h-[min(70vh,28rem)] w-full max-w-md flex-col rounded-[1.85rem] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-heading text-base font-semibold text-foreground">ค้นหาเรื่องเล่า</p>
                <button
                  type="button"
                  className="icon-well inline-flex h-8 w-8"
                  aria-label="ปิดค้นหา"
                  onClick={closeSheet}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={onSubmit}>
                <label className="relative block">
                  <span className="sr-only">ค้นหาเรื่องเล่า</span>
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={mobileInputRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="ชื่อเรื่อง จังหวัด หรือตำนาน"
                    className="liquid-field h-11 w-full rounded-2xl pr-3 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </label>
              </form>
              <div className="mt-3">{categoryChips}</div>
              <div className="mt-3 min-h-0 flex-1 overflow-y-auto">{resultList}</div>
            </div>
          ) : (
            <button
              type="button"
              className="liquid-glass flex h-12 translate-x-[calc(50%+0.375rem)] items-center gap-2 rounded-full px-4 text-sm font-semibold text-primary"
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
