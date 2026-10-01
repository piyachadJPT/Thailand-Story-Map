"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BookOpen, Layers, MapPin, Search, X } from "lucide-react";
import type { StoryListItem } from "@/models/types/story";
import type { PlaceHit } from "@/components/map/geocode";
import { useMapSheetStore } from "@/components/map/mapSheetStore";
import { categoryIcon, storyCategories } from "@/config/categories";
import { provinceRecords } from "@/lib/thai-provinces";
import { cn } from "@/lib/utils";

type SearchMode = "all" | "places" | "stories";

const searchModes = [
  { id: "all", label: "ทั้งหมด", icon: Layers },
  { id: "places", label: "สถานที่", icon: MapPin },
  { id: "stories", label: "เรื่องราว", icon: BookOpen },
] as const;

type SearchStatus = "idle" | "loading" | "ready" | "error";

const traceCard =
  "rounded-2xl border border-dashed border-foreground/12 px-3 py-2.5";

function ResultTraces({ pulse = false }: { pulse?: boolean }) {
  return (
    <div className={cn("space-y-4", pulse && "animate-pulse")} aria-hidden>
      <div>
        <div className="bg-primary/25 mb-2 h-2 w-14 rounded-full" />
        <div className="space-y-2">
          {[0, 1].map((item) => (
            <div key={`place-${item}`} className={traceCard}>
              <div className="bg-foreground/8 h-3.5 w-2/3 rounded-full" />
              <div className="bg-foreground/5 mt-2 h-2.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="bg-primary/25 mb-2 h-2 w-16 rounded-full" />
        <div className="space-y-2">
          {[0, 1, 2].map((item) => (
            <div key={`story-${item}`} className="flex items-start gap-1">
              <div className={cn("min-w-0 flex-1", traceCard)}>
                <div className="bg-foreground/8 h-3.5 w-2/3 rounded-full" />
                <div className="bg-foreground/5 mt-2 h-2.5 w-full rounded-full" />
                <div className="bg-foreground/5 mt-1.5 h-2.5 w-4/5 rounded-full" />
              </div>
              <div className="border-primary/30 mt-2 h-6 w-10 shrink-0 rounded-full border border-dashed" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchSidebar() {
  const [mode, setMode] = useState<SearchMode>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [failedPage, setFailedPage] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchWarning, setSearchWarning] = useState("");
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
    if (!q && !categorySlug && mode !== "stories") {
      const resetTimer = setTimeout(() => {
        setPlaces([]);
        setResults([]);
        setStatus("idle");
        setLoadingMore(false);
        setFailedPage(null);
        setTotal(0);
        setSearchWarning("");
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (page === 1) {
        setStatus("loading");
        setLoadingMore(false);
        setFailedPage(null);
        setResults([]);
        setPlaces([]);
      } else setLoadingMore(true);
      setSearchWarning("");
      const searchStories = mode !== "places";
      const searchPlaces = Boolean(q) && mode !== "stories" && page === 1;
      let nextTotal = 0;
      let nextStories: StoryListItem[] = [];
      let nextPlaces: PlaceHit[] = [];
      let storiesDone = false;
      let placesDone = false;
      let storiesFailed = false;
      let placesFailed = false;

      const publish = () => {
        if (controller.signal.aborted) return;
        setResults((current) =>
          page === 1
            ? nextStories
            : [
                ...new Map(
                  [...current, ...nextStories].map((story) => [story.id, story])
                ).values(),
              ]
        );
        if (page === 1) setPlaces(nextPlaces);
        if (storiesDone && !storiesFailed) setTotal(nextTotal);
        if (!storiesDone || !placesDone) {
          if (nextPlaces.length > 0 || nextStories.length > 0)
            setStatus("ready");
          return;
        }
        setLoadingMore(false);
        setFailedPage(storiesFailed && page > 1 ? page : null);
        setSearchWarning(
          storiesFailed
            ? "ค้นหาเรื่องราวไม่สำเร็จ ลองค้นหาอีกครั้ง"
            : placesFailed
              ? "ค้นหาสถานที่ไม่สำเร็จ แต่ยังค้นหาเรื่องราวได้"
              : ""
        );
        const failed =
          nextStories.length === 0 &&
          nextPlaces.length === 0 &&
          (!searchStories || storiesFailed) &&
          (!searchPlaces || placesFailed);
        setStatus(failed && page === 1 ? "error" : "ready");
      };

      const storiesTask = searchStories
        ? (async () => {
            const params = new URLSearchParams({
              limit: "20",
              page: String(page),
              sort: "recent",
            });
            if (q) params.set("q", q);
            if (categorySlug) params.set("categorySlug", categorySlug);
            const response = await fetch(`/api/stories?${params}`, {
              signal: controller.signal,
            });
            const body = (await response.json()) as {
              data?: StoryListItem[];
              meta?: { total: number };
              message?: string;
            };
            if (!response.ok) throw new Error(body.message || "ค้นหาไม่สำเร็จ");
            nextTotal = body.meta?.total ?? body.data?.length ?? 0;
            return body.data ?? [];
          })()
        : Promise.resolve([]);
      const center = useMapSheetStore.getState().mapCenter;
      const placeParams = new URLSearchParams({
        q,
        mode: "map",
        proximity: `${center.longitude},${center.latitude}`,
      });
      const placesTask = searchPlaces
        ? (async () => {
            const response = await fetch(`/api/geocode?${placeParams}`, {
              signal: controller.signal,
            });
            const body = (await response.json()) as {
              data?: PlaceHit[];
              message?: string;
            };
            if (!response.ok)
              throw new Error(body.message || "ค้นหาสถานที่ไม่สำเร็จ");
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
        }
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
        }
      );
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, categorySlug, mode, page, retryCount]);

  useEffect(() => {
    if (!searchOpen) return;
    mobileInputRef.current?.focus();
  }, [searchOpen]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setRetryCount((current) => current + 1);
  }

  function openPlace(place: PlaceHit) {
    window.dispatchEvent(
      new CustomEvent("map-search-location", { detail: place })
    );
    flyTo(place.longitude, place.latitude, place.zoom);
    closeSheet();
  }

  function openStory(story: StoryListItem) {
    window.dispatchEvent(new CustomEvent("story-selected", { detail: story }));
    flyTo(story.longitude, story.latitude, 15);
    closeSheet();
  }

  useEffect(() => {
    const refresh = () => {
      setPage(1);
      setRetryCount((current) => current + 1);
    };
    window.addEventListener("story-created", refresh);
    window.addEventListener("stories-refresh", refresh);
    return () => {
      window.removeEventListener("story-created", refresh);
      window.removeEventListener("stories-refresh", refresh);
    };
  }, []);

  const modeControls = (
    <div
      className="bg-foreground/5 grid grid-cols-3 gap-1 rounded-2xl p-1"
      role="group"
      aria-label="ประเภทการค้นหา"
    >
      {searchModes.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={mode === item.id}
            onClick={() => {
              setMode(item.id);
              setPage(1);
              if (item.id === "places") setCategorySlug(null);
            }}
            className={cn(
              "focus-visible:outline-primary flex min-h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors focus-visible:outline-2",
              mode === item.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
  const placeholder =
    mode === "stories"
      ? "ชื่อเรื่อง เนื้อหา แท็ก หรือผู้เขียน"
      : mode === "places"
        ? "สถานที่ ถนน ซอย ที่อยู่ หรือพิกัด"
        : "ค้นหาสถานที่ หรือเรื่องราวที่อยากอ่าน";

  const searchField = (
    <form onSubmit={onSubmit}>
      <label className="relative block">
        <span className="sr-only">ค้นหาสถานที่และเรื่องราว</span>
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          maxLength={100}
          placeholder={placeholder}
          className="liquid-field text-foreground placeholder:text-muted-foreground h-11 w-full rounded-2xl pr-3 pl-10 text-sm outline-none"
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
            onClick={() => {
              setCategorySlug(selected ? null : category.slug);
              setPage(1);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200",
              selected
                ? "bg-primary text-primary-foreground shadow-primary/25 shadow-sm"
                : "bg-foreground/5 text-foreground hover:bg-foreground/10"
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

  const clearSearch = (query || categorySlug) && (
    <button
      type="button"
      onClick={() => {
        setQuery("");
        setCategorySlug(null);
        setPage(1);
      }}
      className="text-muted-foreground hover:text-primary inline-flex min-h-8 items-center gap-1 text-xs"
    >
      <X className="h-3.5 w-3.5" />
      ล้างการค้นหา
    </button>
  );

  const resultList = (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {status === "idle" && (
        <p className="text-muted-foreground bg-primary/5 rounded-2xl p-4 text-sm leading-relaxed">
          {mode === "places"
            ? "ค้นหาชื่อสถานที่ ถนน ซอย หรือพิกัด เช่น 13.7563, 100.5018"
            : "ค้นหาทั้งสถานที่บนแผนที่และเรื่องราวจากผู้ใช้ หรือเลือกเรื่องราวเพื่อดูเรื่องที่เพิ่มล่าสุด"}
        </p>
      )}
      {status === "loading" && <ResultTraces pulse />}
      {status === "ready" && places.length === 0 && results.length === 0 && (
        <p className="text-muted-foreground bg-primary/5 rounded-2xl p-4 text-sm leading-relaxed">
          {mode === "stories"
            ? "ไม่พบเรื่องราว ลองค้นจากชื่อเรื่อง จังหวัด หรือเปลี่ยนประเภท"
            : "ไม่พบผลลัพธ์ ลองเพิ่มชื่อสถานที่ ถนน หรือจังหวัดให้ชัดขึ้น"}
        </p>
      )}
      {searchWarning && (
        <p role="status" className="text-destructive mb-3 text-xs">
          {searchWarning}
        </p>
      )}
      {status === "error" && (
        <div className={cn(traceCard, "text-destructive text-sm")}>
          ค้นหาไม่สำเร็จ ลองอีกครั้ง
        </div>
      )}
      {status === "ready" && places.length > 0 && (
        <div className="mb-4">
          <p className="text-primary px-1 pb-2 text-[0.68rem] font-semibold tracking-[0.16em] uppercase">
            สถานที่ · {places.length} แห่ง
          </p>
          <ul className="space-y-2">
            {places.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => openPlace(place)}
                  className={cn(
                    traceCard,
                    "hover:bg-primary/8 block w-full text-left transition-colors"
                  )}
                >
                  <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                    <MapPin className="text-primary h-4 w-4 shrink-0" />
                    {place.title}
                  </p>
                  <p className="text-primary mt-1 text-[0.68rem]">
                    {place.kind ?? "สถานที่"} · ดูบนแผนที่
                  </p>
                  {place.subtitle && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
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
          <p className="text-primary px-1 pb-2 text-[0.68rem] font-semibold tracking-[0.16em] uppercase">
            เรื่องราวจากผู้ใช้ · {total} เรื่อง
          </p>
          <ul className="space-y-2">
            {results.map((story) => (
              <li key={story.id} className="flex items-start gap-1">
                <button
                  type="button"
                  onClick={() => openStory(story)}
                  className={cn(
                    traceCard,
                    "hover:bg-primary/8 min-w-0 flex-1 text-left transition-colors"
                  )}
                >
                  <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="text-primary h-4 w-4 shrink-0" />
                    {story.title}
                  </p>
                  <p className="text-primary mt-1 text-[0.68rem]">
                    {provinceRecords.find(
                      (province) => province.slug === story.provinceSlug
                    )?.name ?? story.provinceSlug}{" "}
                    ·{" "}
                    {storyCategories.find(
                      (category) => category.slug === story.categorySlug
                    )?.name ?? story.categorySlug}
                  </p>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
                    {story.summary}
                  </p>
                  <p className="text-muted-foreground mt-2 text-[0.68rem]">
                    {story.authorName || "ผู้ร่วมแบ่งปัน"} ·{" "}
                    {new Date(story.createdAt).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <span className="text-primary mt-2 inline-block text-xs font-medium">
                    ดูหมุดและรายละเอียด →
                  </span>
                </button>
                <Link
                  href={`/story/${story.provinceSlug}/${story.slug}`}
                  className="border-primary/35 text-primary hover:bg-primary/10 mt-2 shrink-0 rounded-full border border-dashed px-2.5 py-1 text-xs font-semibold transition-colors"
                >
                  อ่าน
                </Link>
              </li>
            ))}
          </ul>
          {results.length < total && (
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => {
                setLoadingMore(true);
                if (failedPage === page)
                  setRetryCount((current) => current + 1);
                else setPage((current) => current + 1);
              }}
              className="border-border text-primary hover:bg-primary/10 mt-3 min-h-11 w-full rounded-xl border text-sm font-medium disabled:opacity-50"
            >
              {loadingMore
                ? "กำลังโหลด…"
                : `ดูเรื่องราวเพิ่มเติม (${results.length}/${total})`}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside
        className="liquid-glass absolute top-4 bottom-4 left-4 z-30 hidden w-[22rem] flex-col rounded-[1.85rem] p-5 lg:flex"
        aria-label="ค้นหาสถานที่และเรื่องราว"
      >
        <div className="space-y-1">
          <p className="text-primary text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
            สำรวจเรื่องราวบนแผนที่
          </p>
          <h2 className="font-heading text-foreground text-xl font-semibold tracking-tight">
            ค้นหาสถานที่และเรื่องราว
          </h2>
        </div>
        <div className="mt-4">{modeControls}</div>
        <div className="mt-3">{searchField}</div>
        {mode !== "places" && <div className="mt-3.5">{categoryChips}</div>}
        <div className="mt-3">{clearSearch}</div>
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto">{resultList}</div>
      </aside>

      {searchOpen && (
        <button
          type="button"
          className="bg-foreground/15 absolute inset-0 z-30 backdrop-blur-[2px] lg:hidden"
          aria-label="ปิดค้นหา"
          onClick={closeSheet}
        />
      )}

      {sheet !== "style" && sheet !== "composer" && (
        <div className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-3 lg:hidden">
          {searchOpen ? (
            <div className="liquid-glass animate-slide-up flex max-h-[min(80dvh,38rem)] w-full max-w-md flex-col rounded-[1.85rem] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-heading text-foreground text-base font-semibold">
                  ค้นหาสถานที่และเรื่องราว
                </p>
                <button
                  type="button"
                  className="icon-well inline-flex h-8 w-8"
                  aria-label="ปิดค้นหา"
                  onClick={closeSheet}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-3">{modeControls}</div>
              <form onSubmit={onSubmit}>
                <label className="relative block">
                  <span className="sr-only">ค้นหาสถานที่และเรื่องราว</span>
                  <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                  <input
                    ref={mobileInputRef}
                    type="search"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setPage(1);
                    }}
                    maxLength={100}
                    placeholder={placeholder}
                    className="liquid-field text-foreground placeholder:text-muted-foreground h-11 w-full rounded-2xl pr-3 pl-10 text-sm outline-none"
                  />
                </label>
              </form>
              {mode !== "places" && <div className="mt-3">{categoryChips}</div>}
              <div className="mt-3">{clearSearch}</div>
              <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
                {resultList}
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="liquid-glass text-primary flex h-12 translate-x-[calc(50%+0.375rem)] items-center gap-2 rounded-full px-4 text-sm font-semibold"
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
