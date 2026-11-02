import { CheckCircle2, CircleDashed } from "lucide-react";
import { Notice } from "@/components/ui/notice";

export type ReviewSnapshot = { title: string; summary: string; sourceUrl: string };

type StepReviewProps = {
  hidden: boolean;
  snapshot: ReviewSnapshot;
  categoryName?: string;
  provinceName?: string;
  hasPoint: boolean;
  coverUrl: string | null;
  isCrime: boolean;
};

/** Step 3 — ตรวจทาน: a read-only summary of what will be submitted. */
export default function StepReview({
  hidden,
  snapshot,
  categoryName,
  provinceName,
  hasPoint,
  coverUrl,
  isCrime,
}: StepReviewProps) {
  const rows = [
    { label: "ประเภทเรื่องราว", value: categoryName },
    { label: "จังหวัด", value: provinceName },
    { label: "ชื่อเรื่อง", value: snapshot.title },
    { label: "สรุปเรื่อง", value: snapshot.summary },
    { label: "แหล่งข้อมูลอ้างอิง", value: snapshot.sourceUrl },
  ];

  return (
    <div data-step="2" hidden={hidden} className="space-y-5">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt="ตัวอย่างรูปปกเรื่องราว"
          className="aspect-video w-full rounded-2xl object-cover ring-1 ring-gold/30"
        />
      ) : null}

      <dl className="divide-y divide-border rounded-2xl border border-border bg-background/40">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_1fr] sm:gap-3">
            <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
            <dd className="text-sm whitespace-pre-line text-foreground wrap-anywhere">
              {row.value || "—"}
            </dd>
          </div>
        ))}
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_1fr] sm:gap-3">
          <dt className="text-xs font-medium text-muted-foreground">ตำแหน่งบนแผนที่</dt>
          <dd className="flex items-center gap-2 text-sm">
            {hasPoint ? (
              <>
                <CheckCircle2 aria-hidden="true" className="size-4 text-success" />
                <span className="text-success">เลือกตำแหน่งแล้ว</span>
              </>
            ) : (
              <>
                <CircleDashed aria-hidden="true" className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">—</span>
              </>
            )}
          </dd>
        </div>
      </dl>

      {isCrime ? (
        <Notice>
          เรื่องคดีอาชญากรรมจะอยู่ในสถานะรอตรวจสอบและยังไม่เผยแพร่ จนกว่าผู้ดูแลจะอนุมัติ
        </Notice>
      ) : null}
    </div>
  );
}
