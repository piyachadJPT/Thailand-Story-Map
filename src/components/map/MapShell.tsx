"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Building2, Map, Moon, Satellite, X } from "lucide-react";
import type { PlaceHit } from "@/components/map/geocode";
import type { StoryMapPoint } from "@/models/types/story";
import { storyCategories } from "@/config/categories";
import { provinceRecords } from "@/lib/thai-provinces";
import { readTheme } from "@/lib/theme";
import { useMapSheetStore } from "@/components/map/mapSheetStore";

/** Democracy Monument — central Bangkok */
const BANGKOK_CENTER: [number, number] = [100.5018, 13.7563];
const BANGKOK_ZOOM = 12;

type MapStyleId = "streets" | "night" | "satellite" | "city3d";

const MAP_STYLES: {
  id: MapStyleId;
  label: string;
  url: string;
  icon: typeof Map;
}[] = [
  {
    id: "streets",
    label: "ถนน",
    url: "mapbox://styles/mapbox/streets-v12",
    icon: Map,
  },
  {
    id: "night",
    label: "กลางคืน",
    url: "mapbox://styles/mapbox/dark-v11",
    icon: Moon,
  },
  {
    id: "satellite",
    label: "ดาวเทียม",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    icon: Satellite,
  },
  {
    id: "city3d",
    label: "เมือง 3D",
    url: "mapbox://styles/mapbox/standard",
    icon: Building2,
  },
];

function styleUrl(id: MapStyleId) {
  return MAP_STYLES.find((style) => style.id === id)?.url ?? MAP_STYLES[0].url;
}

function mapPadding(): mapboxgl.PaddingOptions {
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  return { top: 72, left: wide ? 384 : 0, right: 12, bottom: wide ? 72 : 112 };
}

function applyThaiLabels(map: mapboxgl.Map) {
  const localized = map as mapboxgl.Map & {
    setLanguage?: (language: string) => void;
  };
  localized.setLanguage?.("th");
}

function cityLightPreset() {
  return readTheme() === "dark" ? "night" : "day";
}

function applyStylePresentation(map: mapboxgl.Map, id: MapStyleId) {
  applyThaiLabels(map);
  if (id !== "city3d") return;
  try {
    map.setConfigProperty("basemap", "show3dObjects", true);
    map.setConfigProperty("basemap", "lightPreset", cityLightPreset());
  } catch {
    // Standard style is the only basemap that accepts these config keys.
  }
}

/** Ease-in-out so pitch and bearing ease off instead of stopping abruptly. */
function smoothstep(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function glideCamera(map: mapboxgl.Map, id: MapStyleId) {
  if (id === "city3d") {
    map.flyTo({
      center: map.getCenter(),
      zoom: Math.max(map.getZoom(), 15.2),
      pitch: 60,
      bearing: -17,
      duration: 1700,
      curve: 1.15,
      essential: true,
    });
    return;
  }

  if (map.getPitch() < 1 && Math.abs(map.getBearing()) < 1) return;
  map.easeTo({
    pitch: 0,
    bearing: 0,
    duration: 1200,
    easing: smoothstep,
    essential: true,
  });
}

export default function MapShell({ token }: { token?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLImageElement>(null);
  const fadeGeneration = useRef(0);
  const fadeTimer = useRef<number | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const storyMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const draftMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const placingPinRef = useRef(false);
  const styleIdRef = useRef<MapStyleId>("streets");
  const [styleId, setStyleId] = useState<MapStyleId>("streets");
  const [failed, setFailed] = useState(false);
  const sheet = useMapSheetStore((state) => state.sheet);
  const openSheet = useMapSheetStore((state) => state.openSheet);
  const closeSheet = useMapSheetStore((state) => state.closeSheet);
  const styleOpen = sheet === "style";
  const flyRequest = useMapSheetStore((state) => state.flyRequest);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !token) return;

    if (!mapboxgl.supported(false)) {
      window.setTimeout(() => setFailed(true), 0);
      return;
    }

    mapboxgl.accessToken = token;
    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container,
        style: styleUrl(styleIdRef.current),
        center: BANGKOK_CENTER,
        zoom: BANGKOK_ZOOM,
        language: "th",
        pitchWithRotate: true,
        attributionControl: true,
        failIfMajorPerformanceCaveat: false,
        antialias: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      window.setTimeout(() => setFailed(true), 0);
      return;
    }

    mapRef.current = map;
    map.setPadding(mapPadding());
    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );

    let loadGeneration = 0;
    let disposed = false;
    let focusedStoryId: string | null = new URLSearchParams(
      window.location.search
    ).get("story");
    let focusRequestedStory = Boolean(focusedStoryId);
    let activeStoryPopup: mapboxgl.Popup | null = null;
    const createStoryMarker = (story: StoryMapPoint) => {
      const element = document.createElement("button");
      element.type = "button";
      element.dataset.storyId = story.id;
      const category = storyCategories.find(
        (item) => item.slug === story.categorySlug
      );
      const province = provinceRecords.find(
        (item) => item.slug === story.provinceSlug
      );
      const symbols: Record<string, string> = {
        ghost: "👻",
        history: "🏛️",
        legend: "📖",
        crime: "🛡️",
        local: "🧭",
      };
      element.setAttribute(
        "aria-label",
        `ดูรายละเอียด ${story.title} · ${category?.name ?? "เรื่องราว"}`
      );
      element.setAttribute("aria-haspopup", "dialog");
      element.setAttribute("aria-expanded", "false");
      element.title = `${story.title} · กดดูรายละเอียด`;
      element.className = "story-map-marker";
      element.style.setProperty(
        "--marker-color",
        story.categoryColor ?? "#171717"
      );
      const symbol = document.createElement("span");
      symbol.className = "story-map-marker-symbol";
      symbol.setAttribute("aria-hidden", "true");
      symbol.textContent = symbols[story.categorySlug] ?? "📍";
      element.append(symbol);
      const popupContent = document.createElement("article");
      popupContent.className = "story-map-preview";
      popupContent.tabIndex = 0;
      popupContent.setAttribute("aria-label", `รายละเอียด ${story.title}`);
      const badge = document.createElement("p");
      badge.className = "story-map-preview-category";
      badge.textContent = `${symbols[story.categorySlug] ?? "📍"} ${category?.name ?? "เรื่องราว"}`;
      const heading = document.createElement("h3");
      heading.className = "story-map-preview-title";
      heading.textContent = story.title;
      const location = document.createElement("p");
      location.className = "story-map-preview-location";
      location.textContent = `${province?.name ?? story.provinceSlug} · ${story.viewCount.toLocaleString("th-TH")} ครั้งที่อ่าน`;
      const summary = document.createElement("p");
      summary.className = "story-map-preview-summary";
      summary.textContent = story.summary;
      const link = document.createElement("a");
      link.href = `/story/${story.provinceSlug}/${story.slug}`;
      link.className = "story-map-preview-link";
      link.textContent = "อ่านเรื่องราวทั้งหมด →";
      popupContent.append(badge, heading, location, summary, link);
      const popup = new mapboxgl.Popup({
        offset: 44,
        closeButton: true,
        maxWidth: "min(320px, calc(100vw - 32px))",
        className: "story-map-popup",
        focusAfterOpen: false,
      }).setDOMContent(popupContent);
      popupContent.addEventListener("keydown", (event) => {
        if (
          [
            "ArrowUp",
            "ArrowDown",
            "PageUp",
            "PageDown",
            "Home",
            "End",
            " ",
          ].includes(event.key)
        ) {
          // Keep native text scrolling without moving the map underneath.
          event.stopPropagation();
        }
        if (event.key === "Escape") {
          event.stopPropagation();
          popup.remove();
          element.focus({ preventScroll: true });
        }
      });
      popup.on("open", () => {
        if (activeStoryPopup !== popup) activeStoryPopup?.remove();
        activeStoryPopup = popup;
        popup.getElement()?.setAttribute("role", "dialog");
        popup
          .getElement()
          ?.setAttribute("aria-label", `รายละเอียด ${story.title}`);
        element.setAttribute("aria-expanded", "true");
        element.dataset.active = "true";
        const closeButton = popup
          .getElement()
          ?.querySelector(".mapboxgl-popup-close-button");
        closeButton?.setAttribute("aria-label", "ปิดรายละเอียดเรื่องราว");
      });
      popup.on("close", () => {
        element.setAttribute("aria-expanded", "false");
        delete element.dataset.active;
        if (activeStoryPopup === popup) activeStoryPopup = null;
      });
      const marker = new mapboxgl.Marker({ element, anchor: "bottom" })
        .setLngLat([story.longitude, story.latitude])
        .setPopup(popup)
        .addTo(map);
      return marker;
    };
    const loadStories = async () => {
      const generation = ++loadGeneration;
      try {
        const response = await fetch("/api/stories?view=map", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const body = (await response.json()) as { data?: StoryMapPoint[] };
        if (disposed || generation !== loadGeneration) return;
        storyMarkersRef.current.forEach((marker) => marker.remove());
        storyMarkersRef.current = (body.data ?? []).map((story) => {
          const marker = createStoryMarker(story);
          if (story.id === focusedStoryId) {
            marker.getElement().dataset.featured = "true";
            marker.togglePopup();
            if (focusRequestedStory) {
              map.flyTo({
                center: [story.longitude, story.latitude],
                zoom: 16,
                duration: 1200,
              });
              focusRequestedStory = false;
            }
          }
          return marker;
        });
      } catch {
        // Retain existing markers if the refresh fails.
      }
    };
    const onStoryCreated = (event: Event) => {
      const story = (event as CustomEvent<StoryMapPoint>).detail;
      focusedStoryId = story.id;
      storyMarkersRef.current = storyMarkersRef.current.filter((marker) => {
        if (marker.getElement().dataset.storyId !== story.id) return true;
        marker.remove();
        return false;
      });
      const marker = createStoryMarker(story);
      marker.getElement().dataset.featured = "true";
      marker.togglePopup();
      storyMarkersRef.current.push(marker);
      void loadStories();
    };
    const onStorySelected = (event: Event) => {
      const story = (event as CustomEvent<StoryMapPoint>).detail;
      focusedStoryId = story.id;
      let marker = storyMarkersRef.current.find(
        (item) => item.getElement().dataset.storyId === story.id
      );
      if (!marker) {
        marker = createStoryMarker(story);
        storyMarkersRef.current.push(marker);
      }
      if (!marker.getPopup()?.isOpen()) marker.togglePopup();
    };
    window.addEventListener("story-selected", onStorySelected);
    window.addEventListener("story-created", onStoryCreated);
    void loadStories();
    let searchMarker: mapboxgl.Marker | null = null;
    const onSearchLocation = (event: Event) => {
      const place = (event as CustomEvent<PlaceHit>).detail;
      searchMarker?.remove();
      const content = document.createElement("div");
      const title = document.createElement("p");
      title.className = "text-sm font-semibold";
      title.textContent = place.title;
      const address = document.createElement("p");
      address.className = "mt-1 text-xs text-muted-foreground";
      address.textContent = place.subtitle;
      content.append(title, address);
      searchMarker = new mapboxgl.Marker({ color: "#2563eb" })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(content))
        .addTo(map);
      searchMarker.togglePopup();
    };
    const onMoveEnd = () => {
      const center = map.getCenter();
      useMapSheetStore.getState().setMapCenter(center.lng, center.lat);
    };
    map.on("moveend", onMoveEnd);
    window.addEventListener("map-search-location", onSearchLocation);
    const onStoriesRefresh = () => void loadStories();
    const onPinMode = (event: Event) => {
      placingPinRef.current = (event as CustomEvent<boolean>).detail;
      map.getCanvas().style.cursor = placingPinRef.current ? "crosshair" : "";
      map.setPadding(
        placingPinRef.current
          ? { top: 88, left: 0, right: 0, bottom: 160 }
          : mapPadding()
      );
    };
    const onDraftLocation = (event: Event) => {
      const point = (
        event as CustomEvent<{ longitude: number; latitude: number } | null>
      ).detail;
      draftMarkerRef.current?.remove();
      draftMarkerRef.current = point
        ? new mapboxgl.Marker({ color: "#171717", draggable: true })
            .setLngLat([point.longitude, point.latitude])
            .addTo(map)
        : null;
      draftMarkerRef.current?.on("dragend", () => {
        const location = draftMarkerRef.current?.getLngLat();
        if (!location) return;
        window.dispatchEvent(
          new CustomEvent("story-location-selected", {
            detail: { longitude: location.lng, latitude: location.lat },
          })
        );
      });
    };
    const onMapClick = (event: mapboxgl.MapMouseEvent) => {
      if (!placingPinRef.current) return;

      window.dispatchEvent(
        new CustomEvent("story-location-selected", {
          detail: { longitude: event.lngLat.lng, latitude: event.lngLat.lat },
        })
      );
    };
    map.on("click", onMapClick);
    window.addEventListener("stories-refresh", onStoriesRefresh);
    window.addEventListener("story-pin-mode", onPinMode);
    window.addEventListener("story-draft-location", onDraftLocation);

    map.on("style.load", () => {
      applyStylePresentation(map, styleIdRef.current);
    });

    const onTheme = () => {
      if (styleIdRef.current !== "city3d") return;
      try {
        map.setConfigProperty("basemap", "lightPreset", cityLightPreset());
      } catch {
        // Ignore when the active style has no basemap config.
      }
    };
    window.addEventListener("themechange", onTheme);

    const onResize = () => {
      map.setPadding(
        placingPinRef.current
          ? { top: 88, left: 0, right: 0, bottom: 160 }
          : mapPadding()
      );
      map.resize();
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(container);
    window.addEventListener("resize", onResize);

    const onError = (event: mapboxgl.ErrorEvent) => {
      const status = event.error?.message ?? "";
      if (/unauthorized|invalid token|401/i.test(status)) setFailed(true);
    };
    map.on("error", onError);

    return () => {
      disposed = true;
      window.removeEventListener("story-created", onStoryCreated);
      window.removeEventListener("story-selected", onStorySelected);
      searchMarker?.remove();
      map.off("moveend", onMoveEnd);
      window.removeEventListener("map-search-location", onSearchLocation);
      window.removeEventListener("themechange", onTheme);
      window.removeEventListener("stories-refresh", onStoriesRefresh);
      window.removeEventListener("story-pin-mode", onPinMode);
      window.removeEventListener("story-draft-location", onDraftLocation);
      map.off("click", onMapClick);
      storyMarkersRef.current.forEach((marker) => marker.remove());
      draftMarkerRef.current?.remove();
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyRequest) return;
    map.stop();
    map.flyTo({
      center: [flyRequest.longitude, flyRequest.latitude],
      zoom: flyRequest.zoom,
      pitch: map.getPitch(),
      bearing: map.getBearing(),
      duration: 1500,
      essential: true,
    });
  }, [flyRequest]);

  function holdPreviousFrame(map: mapboxgl.Map) {
    const frame = fadeRef.current;
    if (!frame) return;
    frame.getAnimations().forEach((animation) => animation.cancel());
    try {
      frame.src = map.getCanvas().toDataURL("image/jpeg", 0.72);
    } catch {
      return;
    }
    frame.style.setProperty("opacity", "1");
  }

  function releasePreviousFrame(generation: number) {
    const frame = fadeRef.current;
    if (!frame || fadeGeneration.current !== generation) return;
    frame.getAnimations().forEach((animation) => animation.cancel());
    frame.style.setProperty("opacity", "1");
    const animation = frame.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 700,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "forwards",
    });
    animation.onfinish = () => {
      if (fadeGeneration.current !== generation) return;
      frame.style.setProperty("opacity", "0");
    };
  }

  function selectStyle(id: MapStyleId) {
    closeSheet();
    const map = mapRef.current;
    if (!map || id === styleIdRef.current) return;

    const generation = ++fadeGeneration.current;
    if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
    map.stop();
    holdPreviousFrame(map);

    styleIdRef.current = id;
    setStyleId(id);

    let revealed = false;
    const reveal = () => {
      if (revealed || fadeGeneration.current !== generation) return;
      revealed = true;
      if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(
        () => releasePreviousFrame(generation),
        180
      );
    };

    map.once("style.load", () => {
      if (fadeGeneration.current !== generation) return;
      glideCamera(map, id);
      reveal();
    });
    map.setStyle(
      styleUrl(id),
      (id === "city3d"
        ? {
            config: {
              basemap: { show3dObjects: true, lightPreset: cityLightPreset() },
            },
          }
        : undefined) as Parameters<mapboxgl.Map["setStyle"]>[1]
    );
    fadeTimer.current = window.setTimeout(reveal, 900);
  }

  const activeStyle =
    MAP_STYLES.find((style) => style.id === styleId) ?? MAP_STYLES[0];
  const ActiveIcon = activeStyle.icon;

  if (!token || failed) {
    return (
      <div
        className="page-canvas absolute inset-0 flex items-center justify-center px-6"
        role="status"
      >
        <div className="liquid-glass max-w-sm space-y-4 rounded-[1.85rem] p-8 text-center">
          <div className="bg-primary text-primary-foreground shadow-primary/25 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
            <Map className="h-8 w-8" />
          </div>
          <p className="font-heading text-foreground text-xl font-semibold">
            แผนที่เรื่องเล่า
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {failed
              ? "โทเคน Mapbox ใช้ไม่ได้ ตรวจสอบค่าใน .env"
              : "ตั้ง NEXT_PUBLIC_MAPBOX_TOKEN ใน .env แล้วรีสตาร์ทเซิร์ฟเวอร์"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="story-map absolute inset-0" aria-label="แผนที่เรื่องเล่า">
      <div ref={containerRef} className="h-full w-full" />
      <img
        ref={fadeRef}
        data-map-fade=""
        alt=""
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />
      <div
        className="liquid-glass absolute bottom-5 left-[calc(50%+12rem)] z-20 hidden -translate-x-1/2 gap-0.5 rounded-full p-1 lg:flex"
        role="group"
        aria-label="รูปแบบแผนที่"
      >
        {MAP_STYLES.map((style) => {
          const Icon = style.icon;
          const selected = styleId === style.id;
          return (
            <button
              key={style.id}
              type="button"
              data-map-style={style.id}
              aria-pressed={selected}
              aria-label={style.label}
              onClick={() => selectStyle(style.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                selected
                  ? "bg-primary text-primary-foreground shadow-primary/30 shadow-sm"
                  : "text-foreground hover:bg-primary/10"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {style.label}
            </button>
          );
        })}
      </div>

      {styleOpen && (
        <button
          type="button"
          className="bg-foreground/15 absolute inset-0 z-[45] backdrop-blur-[2px] lg:hidden"
          aria-label="ปิดรูปแบบแผนที่"
          onClick={closeSheet}
        />
      )}

      {sheet !== "search" && sheet !== "composer" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-3 lg:hidden">
          {styleOpen ? (
            <div className="liquid-glass animate-slide-up pointer-events-auto w-full max-w-md rounded-[1.85rem] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-heading text-foreground text-base font-semibold">
                  รูปแบบแผนที่
                </p>
                <button
                  type="button"
                  className="icon-well inline-flex h-8 w-8"
                  aria-label="ปิดรูปแบบแผนที่"
                  onClick={closeSheet}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div
                className="grid grid-cols-2 gap-2"
                role="group"
                aria-label="รูปแบบแผนที่"
              >
                {MAP_STYLES.map((style) => {
                  const Icon = style.icon;
                  const selected = styleId === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      data-map-style={style.id}
                      aria-pressed={selected}
                      onClick={() => selectStyle(style.id)}
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-medium transition-all duration-200 ${
                        selected
                          ? "bg-primary text-primary-foreground shadow-primary/25 shadow-sm"
                          : "bg-primary/10 text-foreground hover:bg-primary/15"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="liquid-glass text-primary pointer-events-auto flex h-12 -translate-x-[calc(50%+0.375rem)] items-center gap-2 rounded-full px-4 text-sm font-semibold"
              aria-label="เปิดรูปแบบแผนที่"
              aria-expanded={false}
              onClick={() => openSheet("style")}
            >
              <ActiveIcon className="h-4 w-4" />
              {activeStyle.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
