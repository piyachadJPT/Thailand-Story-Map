import type { Metadata } from "next";
import Dashboard from "@/components/backoffice/dashboard/Dashboard";
import { getMapboxToken } from "@/config/mapbox";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ภาพรวม", robots: { index: false, follow: false } };

export default function DashboardPage() {
  return <Dashboard mapboxToken={getMapboxToken()} />;
}
