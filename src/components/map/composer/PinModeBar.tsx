import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

type PinModeBarProps = {
  hasPendingPoint: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Shown while picking a point on the map; the composer panel is hidden. */
export default function PinModeBar({ hasPendingPoint, onConfirm, onCancel }: PinModeBarProps) {
  return (
    <div
      role="status"
      className="liquid-glass absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-60 mx-auto flex max-w-lg items-start gap-3 rounded-panel p-4 motion-safe:animate-slide-up"
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground ring-1 ring-gold/50"
      >
        <MapPin className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {hasPendingPoint
            ? "ลากหมุดเพื่อปรับตำแหน่ง แล้วกดยืนยัน"
            : "แตะตำแหน่งบนแผนที่เพื่อวางหมุด"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          เลื่อนและซูมแผนที่ได้ ข้อมูลที่กรอกยังอยู่ครบ
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            className="flex-1"
            disabled={!hasPendingPoint}
            onClick={onConfirm}
          >
            ยืนยันตำแหน่ง
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
        </div>
      </div>
    </div>
  );
}
