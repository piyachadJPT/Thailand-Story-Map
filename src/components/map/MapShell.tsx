"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Building2, Map, Moon, Satellite, X } from "lucide-react";
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
  { id: "streets", label: "ถนน", url: "mapbox://styles/mapbox/streets-v12", icon: Map },
  { id: "night", label: "กลางคืน", url: "mapbox://styles/mapbox/dark-v11", icon: Moon },
  { id: "satellite", label: "ดาวเทียม", url: "mapbox://styles/mapbox/satellite-streets-v12", icon: Satellite },
  { id: "city3d", label: "เมือง 3D", url: "mapbox://styles/mapbox/standard", icon: Building2 },
];

function styleUrl(id: MapStyleId) {
  return MAP_STYLES.find((style) => style.id === id)?.url ?? MAP_STYLES[0].url;
}

function mapPadding(): mapboxgl.PaddingOptions {
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  return { top: 72, left: wide ? 384 : 0, right: 12, bottom: wide ? 72 : 112 };
}

function applyThaiLabels(map: mapboxgl.Map) {
  const localized = map as mapboxgl.Map & { setLanguage?: (language: string) => void };
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
      setFailed(true);
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
      setFailed(true);
      return;
    }

    mapRef.current = map;
    map.setPadding(mapPadding());
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");

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
      map.setPadding(mapPadding());
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
      window.removeEventListener("themechange", onTheme);
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
      fadeTimer.current = window.setTimeout(() => releasePreviousFrame(generation), 180);
    };

    map.once("style.load", () => {
      if (fadeGeneration.current !== generation) return;
      glideCamera(map, id);
      reveal();
    });
    map.setStyle(
      styleUrl(id),
      (id === "city3d"
        ? { config: { basemap: { show3dObjects: true, lightPreset: cityLightPreset() } } }
        : undefined) as Parameters<mapboxgl.Map["setStyle"]>[1],
    );
    fadeTimer.current = window.setTimeout(reveal, 900);
  }

  const activeStyle = MAP_STYLES.find((style) => style.id === styleId) ?? MAP_STYLES[0];
  const ActiveIcon = activeStyle.icon;

  if (!token || failed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-background px-6"
        role="status"
      >
        <div className="max-w-sm space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Map className="h-8 w-8" />
          </div>
          <p className="text-lg font-semibold text-foreground">แผนที่เรื่องเล่า</p>
          <p className="text-sm text-muted-foreground">
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
        className="absolute bottom-5 left-[calc(50%+12rem)] z-20 hidden -translate-x-1/2 gap-0.5 rounded-full border border-border bg-card/85 p-1 shadow-[0_10px_40px_-16px_rgba(10,15,28,0.2)] backdrop-blur-2xl lg:flex"
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
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                selected
                  ? "bg-primary text-primary-foreground"
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
          className="absolute inset-0 z-[45] bg-foreground/10 lg:hidden"
          aria-label="ปิดรูปแบบแผนที่"
          onClick={closeSheet}
        />
      )}

      {sheet !== "search" && (
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-3 lg:hidden">
        {styleOpen ? (
          <div className="pointer-events-auto animate-slide-up w-full max-w-md rounded-3xl border border-border bg-card/85 p-3 shadow-[0_16px_40px_-16px_rgba(10,15,28,0.18)] backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">รูปแบบแผนที่</p>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5"
                aria-label="ปิดรูปแบบแผนที่"
                onClick={closeSheet}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="รูปแบบแผนที่">
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
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-medium transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground"
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
            className="pointer-events-auto flex h-12 -translate-x-[calc(50%+0.375rem)] items-center gap-2 rounded-full border border-border bg-card/80 px-4 text-sm font-medium text-primary shadow-[0_10px_40px_-16px_rgba(10,15,28,0.16)] backdrop-blur-2xl backdrop-saturate-150"
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
