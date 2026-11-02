import { CalendarDays, Eye } from "lucide-react";
import { UserAvatar } from "@/components/auth/AuthControls";

type StoryMetaProps = {
  author: { name: string; image: string | null };
  createdAt: string;
  viewCount: number;
};

/** Author · date · reads */
export default function StoryMeta({ author, createdAt, viewCount }: StoryMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
      <span className="flex items-center gap-2.5">
        <UserAvatar name={author.name} image={author.image} />
        <span className="font-medium text-foreground">{author.name || "ผู้ร่วมแบ่งปัน"}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays aria-hidden="true" className="size-4 text-gold-ink" />
        <time dateTime={createdAt}>
          {new Date(createdAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Bangkok",
          })}
        </time>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Eye aria-hidden="true" className="size-4 text-gold-ink" />
        อ่าน {viewCount.toLocaleString("th-TH")} ครั้ง
      </span>
    </div>
  );
}
