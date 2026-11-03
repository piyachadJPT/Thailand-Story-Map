import type { Metadata } from "next";
import MapShell from "@/components/map/MapShell";
import SearchSidebar from "@/components/map/sidebar/SearchSidebar";
import StoryComposer from "@/components/map/composer/StoryComposer";
import { getMapboxToken } from "@/config/mapbox";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "แผนที่เรื่องเล่าประเทศไทย — ตำนาน เรื่องลี้ลับ ประวัติศาสตร์ ทั่ว 77 จังหวัด",
  absoluteTitle: true,
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  const mapboxToken = getMapboxToken();

  return (
    <div className="absolute inset-0">
      {/* The map page has no visible title; this keeps the page outline complete. */}
      <h1 className="sr-only">แผนที่เรื่องเล่าทั่วประเทศไทย</h1>
      <MapShell token={mapboxToken} />
      <SearchSidebar />
      <StoryComposer />
    </div>
  );
}
