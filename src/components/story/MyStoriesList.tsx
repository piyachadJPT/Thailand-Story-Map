"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { statusLabels } from "@/components/ui/status-badge";
import { TabsContent } from "@/components/ui/tabs";
import type { StoryStatus } from "@/models/enums";
import type { MyStory } from "./myStory";
import MyStoryRow from "./MyStoryRow";

type StatusFilter = "ALL" | StoryStatus;
const order: StoryStatus[] = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];

const tabLabel = (text: string, count: number) => (
  <>
    {text} <span className="ml-1 tabular-nums opacity-70">{count.toLocaleString("th-TH")}</span>
  </>
);

/** My stories with a status filter (client-side; the list is already loaded). */
export default function MyStoriesList({ stories }: { stories: MyStory[] }) {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const count = (status: StoryStatus) => stories.filter((story) => story.status === status).length;
  const items = [
    { value: "ALL" as StatusFilter, label: tabLabel("ทั้งหมด", stories.length) },
    ...order.map((status) => ({
      value: status as StatusFilter,
      label: tabLabel(statusLabels[status], count(status)),
    })),
  ];
  const visible = filter === "ALL" ? stories : stories.filter((story) => story.status === filter);

  return (
    <SegmentedTabs
      aria-label="กรองตามสถานะ"
      scrollable
      items={items}
      value={filter}
      onValueChange={setFilter}
      className="gap-6"
    >
      <TabsContent value={filter} className="outline-none">
        {visible.length > 0 ? (
          <ul aria-label="เรื่องราวที่ฉันเขียน" className="space-y-4">
            {visible.map((story) => (
              <li key={story.id}>
                <MyStoryRow story={story} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={ListFilter} title="ไม่มีเรื่องในสถานะนี้" />
        )}
      </TabsContent>
    </SegmentedTabs>
  );
}
