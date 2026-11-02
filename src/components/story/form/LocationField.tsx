"use client";

import { CheckCircle2, MapPin } from "lucide-react";
import type { PlaceHit } from "@/components/map/geocode";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";
import LocateMeButton from "./LocateMeButton";
import PlaceSearch from "./PlaceSearch";
import type { Point } from "./types";

type LocationFieldProps = {
  hasPoint: boolean;
  onPlace: (place: PlaceHit) => void;
  onLocate: (point: Point) => void;
  onError: (message: string) => void;
  /** Map pick mode; only available where a map is on screen (the composer). */
  pick?: { active: boolean; onStart: () => void };
  /** Extra controls under the buttons, e.g. coordinate inputs on the edit page. */
  children?: React.ReactNode;
};

/** ตำแหน่งบนแผนที่: place search, current location, and (optionally) pick on map. */
export default function LocationField({
  hasPoint,
  onPlace,
  onLocate,
  onError,
  pick,
  children,
}: LocationFieldProps) {
  return (
    <FormField label="ตำแหน่งบนแผนที่">
      <div className="space-y-3">
        <PlaceSearch onSelect={onPlace} />
        <LocateMeButton onLocate={onLocate} onError={onError} />

        {pick ? (
          <>
            <p className="flex items-center gap-3 text-xs text-muted-foreground">
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              หรือ
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </p>
            {hasPoint ? (
              <p role="status" className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 aria-hidden="true" className="size-4" />
                เลือกตำแหน่งแล้ว
              </p>
            ) : null}
            <Button
              type="button"
              id="story-location-button"
              variant="outline"
              className="w-full aria-pressed:border-gold aria-pressed:bg-gold/15"
              aria-pressed={pick.active}
              onClick={pick.onStart}
            >
              <MapPin aria-hidden="true" className="text-gold-ink" />
              {pick.active
                ? "คลิกตำแหน่งที่ต้องการบนแผนที่…"
                : hasPoint
                  ? "เปลี่ยนตำแหน่งบนแผนที่"
                  : "เลือกตำแหน่งบนแผนที่"}
            </Button>
          </>
        ) : null}

        {children}
      </div>
    </FormField>
  );
}
