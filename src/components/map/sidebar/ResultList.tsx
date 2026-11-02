import { Button } from "@/components/ui/button";
import PlaceResultItem from "./PlaceResultItem";
import ResultGroup from "./ResultGroup";
import ResultItem from "./ResultItem";
import SidebarSkeleton from "./SidebarSkeleton";
import type { StorySearch } from "./useStorySearch";

const noteClasses =
  "rounded-2xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground";

/** Results grouped under "สถานที่" and "เรื่องราว", plus every search state. */
export default function ResultList({ search }: { search: StorySearch }) {
  const { status, mode, places, results, total, warning, loadingMore } = search;
  const empty = places.length === 0 && results.length === 0;

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-2">
      {status === "idle" ? (
        <p className={noteClasses}>
          {mode === "places"
            ? "ค้นหาชื่อสถานที่ ถนน ซอย หรือพิกัด เช่น 13.7563, 100.5018"
            : "ค้นหาทั้งสถานที่บนแผนที่และเรื่องราวจากผู้ใช้ หรือเลือกเรื่องราวเพื่อดูเรื่องที่เพิ่มล่าสุด"}
        </p>
      ) : null}
      {status === "loading" ? <SidebarSkeleton /> : null}
      {status === "ready" && empty ? (
        <p className={noteClasses}>
          {mode === "stories"
            ? "ไม่พบเรื่องราว ลองค้นจากชื่อเรื่อง จังหวัด หรือเปลี่ยนประเภท"
            : "ไม่พบผลลัพธ์ ลองเพิ่มชื่อสถานที่ ถนน หรือจังหวัดให้ชัดขึ้น"}
        </p>
      ) : null}
      {warning ? (
        <p role="status" className="text-xs text-destructive">
          {warning}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="rounded-2xl border border-dashed border-destructive/40 p-4 text-sm text-destructive">
          ค้นหาไม่สำเร็จ ลองอีกครั้ง
        </p>
      ) : null}

      {status === "ready" && places.length > 0 ? (
        <ResultGroup title="สถานที่" count={`${places.length} แห่ง`}>
          {places.map((place) => (
            <PlaceResultItem key={place.id} place={place} onSelect={search.openPlace} />
          ))}
        </ResultGroup>
      ) : null}

      {status === "ready" && results.length > 0 ? (
        <ResultGroup title="เรื่องราว" count={`${total} เรื่อง`}>
          {results.map((story) => (
            <ResultItem key={story.id} story={story} onSelect={search.openStory} />
          ))}
        </ResultGroup>
      ) : null}

      {status === "ready" && results.length > 0 && results.length < total ? (
        <Button
          variant="outline"
          className="w-full"
          disabled={loadingMore}
          onClick={search.loadMore}
        >
          {loadingMore
            ? "กำลังโหลด…"
            : `ดูเรื่องราวเพิ่มเติม (${results.length}/${total})`}
        </Button>
      ) : null}
    </div>
  );
}
