import MapShell from "@/components/map/MapShell";
import SearchSidebar from "@/components/map/sidebar/SearchSidebar";
import StoryComposer from "@/components/map/composer/StoryComposer";
import { getMapboxToken } from "@/config/mapbox";

export default function Home() {
  const mapboxToken = getMapboxToken();

  return (
    <div className="absolute inset-0">
      {/* The map page has no visible title; this keeps the page outline complete. */}
      <h1 className="sr-only">แผนที่เรื่องเล่า</h1>
      <MapShell token={mapboxToken} />
      <SearchSidebar />
      <StoryComposer />
    </div>
  );
}
