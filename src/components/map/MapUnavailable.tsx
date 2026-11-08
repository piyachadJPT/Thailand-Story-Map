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
        <Map aria-hidden="true" strokeWidth={1.5} className="mx-auto size-10 text-gold-ink" />
        <p className="font-heading text-xl font-bold text-foreground">
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
