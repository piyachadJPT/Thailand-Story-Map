"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapSheetStore } from "./mapSheetStore";
import { attachComposerLayer } from "./composerLayer";
import { clonePinIcon } from "./MapPin";
import MapStyleSwitcher from "./MapStyleSwitcher";
import MapUnavailable from "./MapUnavailable";
import {
  applyStylePresentation,
  BANGKOK_CENTER,
  BANGKOK_ZOOM,
  cityLightPreset,
  mapPadding,
  styleUrl,
} from "./mapStyles";
import PinIconSprite from "./PinIconSprite";
import { attachPlaceLayer } from "./placeLayer";
import { attachStoryLayer } from "./storyLayer";
import { useMapStyle } from "./useMapStyle";

export default function MapShell({ token }: { token?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [failed, setFailed] = useState(false);
  const flyRequest = useMapSheetStore((state) => state.flyRequest);
  const { styleId, styleIdRef, fadeRef, selectStyle, clearFadeTimer } =
    useMapStyle(mapRef);

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

    const getIcon = (key: string) => clonePinIcon(spriteRef.current, key);
    const detachStories = attachStoryLayer(map, getIcon);
    const detachPlace = attachPlaceLayer(map, getIcon);
    const composer = attachComposerLayer(map, getIcon);

    const onMoveEnd = () => {
      const center = map.getCenter();
      useMapSheetStore.getState().setMapCenter(center.lng, center.lat);
    };
    map.on("moveend", onMoveEnd);
    map.on("style.load", () => applyStylePresentation(map, styleIdRef.current));

    const onTheme = () => {
      if (styleIdRef.current === "streets") {
        map.setStyle(styleUrl("streets"));
        return;
      }
      if (styleIdRef.current !== "city3d") return;
      try {
        map.setConfigProperty("basemap", "lightPreset", cityLightPreset());
      } catch {
        // Ignore when the active style has no basemap config.
      }
    };
    window.addEventListener("themechange", onTheme);
    const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    themeMedia.addEventListener("change", onTheme);

    const onResize = () => {
      map.setPadding(composer.padding());
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
      detachStories();
      detachPlace();
      composer.dispose();
      map.off("moveend", onMoveEnd);
      window.removeEventListener("themechange", onTheme);
      themeMedia.removeEventListener("change", onTheme);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      clearFadeTimer();
      map.remove();
      mapRef.current = null;
    };
  }, [token, styleIdRef, clearFadeTimer]);

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

  if (!token || failed) return <MapUnavailable invalidToken={failed} />;

  return (
    <div className="story-map absolute inset-0" aria-label="แผนที่เรื่องเล่า">
      <div ref={containerRef} className="size-full" />
      {/* Holds a canvas snapshot (data URL) during style changes; next/image does not apply. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={fadeRef}
        data-map-fade=""
        alt=""
        className="pointer-events-none absolute inset-0 z-10 size-full"
      />
      <PinIconSprite ref={spriteRef} />
      <MapStyleSwitcher value={styleId} onChange={selectStyle} />
    </div>
  );
}
