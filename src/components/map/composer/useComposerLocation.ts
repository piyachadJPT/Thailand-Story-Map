"use client";

import { useState } from "react";
import type { PlaceHit } from "@/components/map/geocode";
import { useMapSheetStore } from "@/components/map/mapSheetStore";
import type { Point } from "@/components/story/form/types";

function showDraft(point: Point | null) {
  window.dispatchEvent(new CustomEvent("story-draft-location", { detail: point }));
}

/**
 * The story's point on the map, plus "pick on map" mode where a pending
 * point is placed (and dragged) before it is confirmed.
 */
export function useComposerLocation() {
  const flyTo = useMapSheetStore((state) => state.flyTo);
  const [point, setPoint] = useState<Point | null>(null);
  const [pendingPoint, setPendingPoint] = useState<Point | null>(null);
  const [pinMode, setPinMode] = useState(false);

  function updatePoint(next: Point | null) {
    setPoint(next);
    showDraft(next);
  }

  return {
    point,
    pendingPoint,
    pinMode,
    updatePoint,
    /** Drop pick mode without touching the point (used when closing). */
    stopPicking: () => setPinMode(false),
    clearPending: () => setPendingPoint(null),
    goToPlace(place: PlaceHit) {
      updatePoint({ longitude: place.longitude, latitude: place.latitude });
      setPinMode(false);
      flyTo(place.longitude, place.latitude, Math.max(place.zoom, 16));
    },
    locate(next: Point) {
      updatePoint(next);
      flyTo(next.longitude, next.latitude, 16);
    },
    startPick() {
      setPendingPoint(point);
      setPinMode(true);
      if (point) flyTo(point.longitude, point.latitude, 16);
    },
    confirmPick() {
      if (pendingPoint) updatePoint(pendingPoint);
      setPinMode(false);
    },
    cancelPick() {
      updatePoint(point);
      setPinMode(false);
    },
    /** A point clicked or dragged on the map. */
    receiveMapPoint(selected: Point) {
      if (!pinMode) return updatePoint(selected);
      setPendingPoint(selected);
      showDraft(selected);
    },
  };
}
