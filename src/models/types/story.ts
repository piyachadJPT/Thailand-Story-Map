import type { StoryStatus } from "@/models/enums";

/** Marker on map / list card */
export interface StoryMapPoint {
  id: string;
  title: string;
  slug: string;
  summary: string;
  latitude: number;
  longitude: number;
  categorySlug: string;
  categoryColor: string | null;
  provinceSlug: string;
  viewCount: number;
}

export interface StoryListItem extends StoryMapPoint {
  status: StoryStatus;
  createdAt: string;
}

export interface StoryDetail extends StoryListItem {
  content: string;
  sourceUrl: string | null;
  isSensitive: boolean;
  rejectReason: string | null;
  images: { id: string; url: string; altText: string | null; sortOrder: number }[];
  tags: { id: string; name: string; slug: string }[];
  author: { id: string; name: string; image: string | null };
}
