"use client";

import { GoldDivider } from "@/components/ui/gold-divider";
import { SectionHeading } from "@/components/ui/section-heading";
import MobileSearchSheet from "./MobileSearchSheet";
import SearchPanel from "./SearchPanel";
import { useStorySearch } from "./useStorySearch";

/** Map search: floating glass panel on desktop, bottom sheet on mobile. */
export default function SearchSidebar() {
  const search = useStorySearch();

  return (
    <>
      <aside
        aria-label="ค้นหาสถานที่และเรื่องราว"
        className="liquid-glass absolute top-4 bottom-4 left-4 z-30 hidden w-88 flex-col rounded-panel p-5 lg:flex"
      >
        <SectionHeading
          size="sm"
          eyebrow="สำรวจเรื่องราวบนแผนที่"
          title="ค้นหาสถานที่และเรื่องราว"
          className="gap-2"
        />
        <GoldDivider strength="subtle" className="my-4" />
        <SearchPanel search={search} className="min-h-0" />
      </aside>

      <MobileSearchSheet search={search} />
    </>
  );
}
