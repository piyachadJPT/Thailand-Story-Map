import type { StoryStatus } from "@/models/enums";

/** A row on /my-stories, already serialized for the client list. */
export type MyStory = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  status: StoryStatus;
  rejectReason: string | null;
  updatedAt: string;
  viewCount: number;
  cover: { url: string; altText: string | null } | null;
  categoryName: string;
  categorySlug: string;
  provinceName: string;
  provinceSlug: string;
};
