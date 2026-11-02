import type { Metadata } from "next";
import StoryReview from "@/components/backoffice/stories/StoryReview";
import { getMapboxToken } from "@/config/mapbox";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ตรวจเรื่อง", robots: { index: false, follow: false } };

export default async function StoryReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoryReview id={id} mapboxToken={getMapboxToken()} />;
}
