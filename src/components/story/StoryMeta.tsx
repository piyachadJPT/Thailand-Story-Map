import { CalendarDays, Eye, RefreshCw } from "lucide-react";
import { UserAvatar } from "@/components/auth/AuthControls";

type StoryMetaProps = {
  author: { name: string; image: string | null };
  publishedAt: string;
  /** Shown only when it is more than a day after publishing. */
  updatedAt?: string;
  viewCount: number;
};

const DAY = 24 * 60 * 60 * 1000;

function thaiDate(value: string) {
  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
}

/** Author · published (· updated) · reads */
export default function StoryMeta({ author, publishedAt, updatedAt, viewCount }: StoryMetaProps) {
  const showUpdated =
    updatedAt && new Date(updatedAt).getTime() - new Date(publishedAt).getTime() > DAY;
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
      <span className="flex items-center gap-2.5">
        <UserAvatar name={author.name} image={author.image} />
        <span className="font-medium text-foreground">{author.name || "ผู้ร่วมแบ่งปัน"}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays aria-hidden="true" className="size-4 text-gold-ink" />
        เผยแพร่ <time dateTime={publishedAt}>{thaiDate(publishedAt)}</time>
      </span>
      {showUpdated ? (
        <span className="inline-flex items-center gap-1.5">
          <RefreshCw aria-hidden="true" className="size-4 text-gold-ink" />
          อัปเดต <time dateTime={updatedAt}>{thaiDate(updatedAt)}</time>
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1.5">
        <Eye aria-hidden="true" className="size-4 text-gold-ink" />
        อ่าน {viewCount.toLocaleString("th-TH")} ครั้ง
      </span>
    </div>
  );
}
