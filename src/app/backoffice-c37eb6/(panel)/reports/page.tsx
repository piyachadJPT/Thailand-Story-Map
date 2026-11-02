import type { Metadata } from "next";
import ReportsView from "@/components/backoffice/reports/ReportsView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "รายงาน", robots: { index: false, follow: false } };

export default function ReportsPage() {
  return <ReportsView />;
}
