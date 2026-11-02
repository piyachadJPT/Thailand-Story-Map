import { Map } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

/** Shown instead of the map when the Mapbox token is missing or invalid. */
export default function MapUnavailable({ invalidToken }: { invalidToken: boolean }) {
  return (
    <div
      className="page-canvas absolute inset-0 flex items-center justify-center px-6"
      role="status"
    >
      <GlassPanel gilded padding="lg" className="max-w-sm space-y-4 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift ring-1 ring-gold/50">
          <Map aria-hidden="true" className="size-7" />
        </div>
        <p className="font-heading text-xl font-semibold text-foreground">
          แผนที่เรื่องเล่า
        </p>
        <p className="text-sm text-muted-foreground">
          {invalidToken
            ? "โทเคน Mapbox ใช้ไม่ได้ ตรวจสอบค่าใน .env"
            : "ตั้ง NEXT_PUBLIC_MAPBOX_TOKEN ใน .env แล้วรีสตาร์ทเซิร์ฟเวอร์"}
        </p>
      </GlassPanel>
    </div>
  );
}
