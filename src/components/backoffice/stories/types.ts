import type { getAdminStory, listAdminStories } from "@/api/admin/stories";
import type { Jsonify } from "@/models/types/admin";

export type StoryList = Jsonify<Awaited<ReturnType<typeof listAdminStories>>>;
export type StoryRow = StoryList["data"][number];
export type StoryDetail = Jsonify<Awaited<ReturnType<typeof getAdminStory>>>;
