"use client";

import { BookOpen, Layers, MapPin } from "lucide-react";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { SearchMode } from "./useStorySearch";

const searchModes = [
  { value: "all", label: "ทั้งหมด", icon: Layers },
  { value: "places", label: "สถานที่", icon: MapPin },
  { value: "stories", label: "เรื่องราว", icon: BookOpen },
] as const;

type SearchTabsProps = {
  value: SearchMode;
  onValueChange: (mode: SearchMode) => void;
  className?: string;
  /** The search form and results; rendered as the active tab panel. */
  children: React.ReactNode;
};

/** ทั้งหมด / สถานที่ / เรื่องราว */
export default function SearchTabs({
  value,
  onValueChange,
  className,
  children,
}: SearchTabsProps) {
  return (
    <SegmentedTabs
      aria-label="ประเภทการค้นหา"
      size="sm"
      items={searchModes}
      value={value}
      onValueChange={onValueChange}
      className={cn("min-h-0", className)}
    >
      <TabsContent
        value={value}
        className="flex min-h-0 flex-1 flex-col gap-3 focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        {children}
      </TabsContent>
    </SegmentedTabs>
  );
}
