"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Point } from "./types";

type LocateMeButtonProps = {
  onLocate: (point: Point) => void;
  onError: (message: string) => void;
};

/** "ใช้ตำแหน่งปัจจุบันของฉัน" via the browser's geolocation. */
export default function LocateMeButton({ onLocate, onError }: LocateMeButtonProps) {
  const [locating, setLocating] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={locating}
      onClick={() => {
        if (!navigator.geolocation) {
          onError("อุปกรณ์นี้ไม่รองรับการหาตำแหน่ง กรุณาค้นหาสถานที่หรือเลือกบนแผนที่");
          return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocating(false);
            onLocate({
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
            });
          },
          () => {
            setLocating(false);
            onError("หาตำแหน่งไม่ได้ กรุณาอนุญาตตำแหน่ง หรือค้นหาสถานที่แทน");
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }}
    >
      <LocateFixed aria-hidden="true" className="text-gold-ink" />
      {locating ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบันของฉัน"}
    </Button>
  );
}
