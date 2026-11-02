import type { Metadata } from "next";
import StoriesView from "@/components/backoffice/stories/StoriesView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "เรื่อง", robots: { index: false, follow: false } };

export default function StoriesPage() {
  return <StoriesView />;
}
