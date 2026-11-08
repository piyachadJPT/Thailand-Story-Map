"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { StoryListItem } from "@/models/types/story";
import { isCategorySlug } from "@/config/categories";
import type { PlaceHit } from "../geocode";
import { useMapSheetStore } from "../mapSheetStore";
import { fetchPlaces, fetchStoryPage } from "./searchRequests";

export type SearchMode = "all" | "places" | "stories";
export type SearchStatus = "idle" | "loading" | "ready" | "error";

/** Search state for the map sidebar: stories (paged) and places (geocoder). */
export function useStorySearch() {
  const [mode, setModeState] = useState<SearchMode>("all");
  const [query, setQueryState] = useState("");
  const [page, setPage] = useState(1);
  const [failedPage, setFailedPage] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [warning, setWarning] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [places, setPlaces] = useState<PlaceHit[]>([]);
  const [results, setResults] = useState<StoryListItem[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const flyTo = useMapSheetStore((state) => state.flyTo);
  const closeSheet = useMapSheetStore((state) => state.closeSheet);

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
        setWarning("");
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const controller = new AbortController();
    const { signal } = controller;
    const timer = setTimeout(() => {
      if (page === 1) {
        setStatus("loading");
        setLoadingMore(false);
        setFailedPage(null);
        setResults([]);
        setPlaces([]);
      } else setLoadingMore(true);
      setWarning("");
      const searchStories = mode !== "places";
      const searchPlaces = Boolean(q) && mode !== "stories" && page === 1;
      const center = useMapSheetStore.getState().mapCenter;
      let nextTotal = 0;
      let nextStories: StoryListItem[] = [];
      let nextPlaces: PlaceHit[] = [];
      let storiesDone = false;
      let placesDone = false;
      let storiesFailed = false;
      let placesFailed = false;

      const publish = () => {
        if (signal.aborted) return;
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
          if (nextPlaces.length > 0 || nextStories.length > 0) setStatus("ready");
          return;
        }
        setLoadingMore(false);
        setFailedPage(storiesFailed && page > 1 ? page : null);
        setWarning(
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
        ? fetchStoryPage({ q, categorySlug, page, signal })
        : Promise.resolve({ stories: [], total: 0 });
      const placesTask = searchPlaces
        ? fetchPlaces({ q, center, signal })
        : Promise.resolve([]);

      storiesTask.then(
        (found) => {
          nextStories = found.stories;
          if (searchStories) nextTotal = found.total;
          storiesDone = true;
          publish();
        },
        () => {
          if (signal.aborted) return;
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
          if (signal.aborted) return;
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

  // "ดูบนแผนที่" links from category pages open the map with ?category=<slug>.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("category");
    if (!slug || !isCategorySlug(slug)) return;
    const timer = setTimeout(() => setCategorySlug(slug), 0);
    return () => clearTimeout(timer);
  }, []);

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

  return {
    mode,
    query,
    categorySlug,
    places,
    results,
    total,
    status,
    warning,
    loadingMore,
    setMode(next: SearchMode) {
      setModeState(next);
      setPage(1);
      if (next === "places") setCategorySlug(null);
    },
    setQuery(next: string) {
      setQueryState(next);
      setPage(1);
    },
    toggleCategory(slug: string) {
      setCategorySlug(categorySlug === slug ? null : slug);
      setPage(1);
    },
    clear() {
      setQueryState("");
      setCategorySlug(null);
      setPage(1);
    },
    submit(event: FormEvent) {
      event.preventDefault();
      setPage(1);
      setRetryCount((current) => current + 1);
    },
    loadMore() {
      setLoadingMore(true);
      if (failedPage === page) setRetryCount((current) => current + 1);
      else setPage((current) => current + 1);
    },
    openPlace(place: PlaceHit) {
      window.dispatchEvent(new CustomEvent("map-search-location", { detail: place }));
      flyTo(place.longitude, place.latitude, place.zoom);
      closeSheet();
    },
    openStory(story: StoryListItem) {
      // The story layer flies there itself so the preview card ends up centered.
      window.dispatchEvent(new CustomEvent("story-selected", { detail: story }));
      closeSheet();
    },
  };
}

export type StorySearch = ReturnType<typeof useStorySearch>;
