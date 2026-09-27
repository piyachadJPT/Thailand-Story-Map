import MainLayout from "@/components/layout/MainLayout";
import MapShell from "@/components/map/MapShell";
import SearchSidebar from "@/components/map/SearchSidebar";

export default function Home() {
  return (
    <MainLayout hideFooter>
      <div className="absolute inset-0">
        <MapShell />
        <SearchSidebar />
      </div>
    </MainLayout>
  );
}
