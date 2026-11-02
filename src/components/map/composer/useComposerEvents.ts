"use client";

import { useEffect, useEffectEvent } from "react";
import type { Point } from "@/components/story/form/types";

type ComposerEvents = {
  /** Logged in: listen for "story-composer-open" and ?compose=1. */
  enabled: boolean;
  open: boolean;
  pinMode: boolean;
  onOpenRequest: () => void;
  /** A point picked on the map ("story-location-selected"). */
  onMapPoint: (point: Point) => void;
  onEscape: () => void;
};

/** Window events that drive the composer from outside its own UI. */
export function useComposerEvents({
  enabled,
  open,
  pinMode,
  onOpenRequest,
  onMapPoint,
  onEscape,
}: ComposerEvents) {
  const requestOpen = useEffectEvent(onOpenRequest);
  const mapPoint = useEffectEvent(onMapPoint);
  const escape = useEffectEvent(onEscape);

  useEffect(() => {
    if (!enabled) return;
    const onOpen = () => requestOpen();
    window.addEventListener("story-composer-open", onOpen);
    const url = new URL(window.location.href);
    if (url.searchParams.get("compose") === "1") {
      window.setTimeout(onOpen, 0);
      url.searchParams.delete("compose");
      window.history.replaceState(window.history.state, "", url.toString());
    }
    return () => window.removeEventListener("story-composer-open", onOpen);
  }, [enabled]);

  useEffect(() => {
    const onLocation = (event: Event) => mapPoint((event as CustomEvent<Point>).detail);
    window.addEventListener("story-location-selected", onLocation);
    return () => window.removeEventListener("story-location-selected", onLocation);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("story-pin-mode", { detail: pinMode }));
  }, [pinMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") escape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
}
