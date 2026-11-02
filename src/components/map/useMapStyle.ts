"use client";

import { useCallback, useRef, useState, type RefObject } from "react";
import type mapboxgl from "mapbox-gl";
import { useMapSheetStore } from "./mapSheetStore";
import { cityLightPreset, glideCamera, styleUrl, type MapStyleId } from "./mapStyles";

/**
 * Current basemap style plus a cross-fade: the old frame is held in an <img>
 * (fadeRef) while the new style loads, then faded out.
 */
export function useMapStyle(mapRef: RefObject<mapboxgl.Map | null>) {
  const fadeRef = useRef<HTMLImageElement>(null);
  const fadeGeneration = useRef(0);
  const fadeTimer = useRef<number | null>(null);
  const styleIdRef = useRef<MapStyleId>("streets");
  const [styleId, setStyleId] = useState<MapStyleId>("streets");

  const clearFadeTimer = useCallback(() => {
    if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
  }, []);

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
    useMapSheetStore.getState().closeSheet();
    const map = mapRef.current;
    if (!map || id === styleIdRef.current) return;

    const generation = ++fadeGeneration.current;
    clearFadeTimer();
    map.stop();
    holdPreviousFrame(map);

    styleIdRef.current = id;
    setStyleId(id);

    let revealed = false;
    const reveal = () => {
      if (revealed || fadeGeneration.current !== generation) return;
      revealed = true;
      clearFadeTimer();
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

  return { styleId, styleIdRef, fadeRef, selectStyle, clearFadeTimer };
}
