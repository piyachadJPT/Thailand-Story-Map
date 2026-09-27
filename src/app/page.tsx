import MainLayout from "@/components/layout/MainLayout";
import MapShell from "@/components/map/MapShell";
import SearchSidebar from "@/components/map/SearchSidebar";
import { getMapboxToken } from "@/config/mapbox";

export default function Home() {
  const mapboxToken = getMapboxToken();

  return (
    <MainLayout hideFooter>
      <div className="absolute inset-0">
        <MapShell token={mapboxToken} />
        <SearchSidebar />
      </div>
    </MainLayout>
  );
}
