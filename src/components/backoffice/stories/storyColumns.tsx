"use client";

import { Flag, RotateCcw, ShieldAlert } from "lucide-react";
import CategoryChip from "@/components/story/CategoryChip";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StoryStatus } from "@/models/enums";
import { cn } from "@/lib/utils";
import Avatar from "../Avatar";
import type { Column } from "../DataTable";
import RelativeTime from "../RelativeTime";
import { Cover } from "../dashboard/Feeds";
import { formatDuration, formatNumber, hoursSince } from "../format";
import StoryActionsMenu from "./StoryActionsMenu";
import type { StoryRow } from "./types";

export function StoryTitleCell({ story }: { story: StoryRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Cover url={story.coverUrl} categorySlug={story.category.slug} />
      <div className="min-w-0 max-w-52 xl:max-w-60 min-[1400px]:max-w-72 2xl:max-w-md">
        <p className="truncate font-medium text-foreground">{story.title}</p>
        <p className="truncate text-xs text-muted-foreground">{story.summary}</p>
        {story.resubmitted || story.isSensitive ? (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {story.resubmitted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/12 px-2 py-0.5 text-[0.7rem] text-gold-ink">
                <RotateCcw aria-hidden="true" className="size-3" />
                ส่งใหม่หลังถูกปฏิเสธ
              </span>
            ) : null}
            {story.isSensitive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/12 px-2 py-0.5 text-[0.7rem] text-warning">
                <ShieldAlert aria-hidden="true" className="size-3" />
                เนื้อหาอ่อนไหว
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function WaitingBadge({ since }: { since: string }) {
  const hours = hoursSince(since);
  return (
    <span
      title={new Date(since).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
      className={cn("text-sm whitespace-nowrap tabular-nums", hours > 24 ? "font-medium text-warning" : "text-muted-foreground")}
    >
      รอ {formatDuration(hours)}
    </span>
  );
}

/** Columns shared by the stories page and a user's stories tab. */
export function storyColumns({ pendingTab, showAuthor = true }: { pendingTab: boolean; showAuthor?: boolean }) {
  const columns: Column<StoryRow>[] = [
    { key: "story", header: "เรื่อง", cell: (story) => <StoryTitleCell story={story} /> },
    {
      key: "category",
      header: "หมวด",
      cardLabel: "หมวด",
      cell: (story) => <CategoryChip slug={story.category.slug} />,
    },
    {
      key: "province",
      header: "จังหวัด",
      className: "hidden min-[1400px]:table-cell",
      cardLabel: "จังหวัด",
      cell: (story) => <span className="whitespace-nowrap">{story.province.name}</span>,
    },
  ];
  if (showAuthor) {
    columns.push({
      key: "author",
      header: "ผู้เขียน",
      className: "hidden xl:table-cell",
      cardLabel: "ผู้เขียน",
      cell: (story) => (
        <span className="flex min-w-0 items-center gap-2">
          <Avatar id={story.author.id} name={story.author.name} image={story.author.image} size="xs" />
          <span className="max-w-28 truncate xl:max-w-36">{story.author.name}</span>
        </span>
      ),
    });
  }
  columns.push(
    {
      key: "date",
      header: pendingTab ? "ส่งเมื่อ" : "แก้ล่าสุด",
      cardLabel: pendingTab ? "รอตรวจ" : "แก้ล่าสุด",
      sort: pendingTab
        ? [
            { value: "oldest", direction: "asc" },
            { value: "newest", direction: "desc" },
          ]
        : [
            { value: "newest", direction: "desc" },
            { value: "oldest", direction: "asc" },
          ],
      cell: (story) =>
        pendingTab ? (
          <WaitingBadge since={story.updatedAt} />
        ) : (
          <RelativeTime value={story.updatedAt} className="text-sm whitespace-nowrap text-muted-foreground" />
        ),
    },
    {
      key: "reports",
      header: "รายงาน",
      align: "right",
      cardLabel: "รายงานเปิด",
      sort: [{ value: "reports", direction: "desc" }],
      cell: (story) =>
        story.openReports > 0 ? (
          <span className="inline-flex items-center gap-1 font-medium text-destructive">
            <Flag aria-hidden="true" className="size-3.5" />
            {formatNumber(story.openReports)}
          </span>
        ) : (
          <span className="text-muted-foreground">0</span>
        ),
    },
    {
      key: "status",
      header: "สถานะ",
      cardLabel: "สถานะ",
      cell: (story) => <StatusBadge status={story.status as StoryStatus} className="h-6 gap-1.5 px-2.5" />,
    },
    {
      key: "actions",
      header: <span className="sr-only">การจัดการ</span>,
      className: "w-12",
      stickyRight: true,
      cell: (story) => <StoryActionsMenu story={story} />,
    }
  );
  // Every row in the pending queue has the same status.
  return pendingTab ? columns.filter((column) => column.key !== "status") : columns;
}
