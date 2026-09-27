import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/models/types/api";
import type { StoryDetail, StoryListItem, StoryMapPoint } from "@/models/types/story";
import type { CreateStoryInput, ListStoriesQuery } from "@/models/schemas";

function toSearchParams(query: Partial<ListStoriesQuery>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.toString();
}

export const storiesClient = {
  list(query: Partial<ListStoriesQuery> = {}) {
    const qs = toSearchParams(query);
    return api.get<PaginatedResponse<StoryListItem>>(`/api/stories${qs ? `?${qs}` : ""}`);
  },

  mapPoints(query: Pick<ListStoriesQuery, "categorySlug" | "provinceSlug" | "tagSlug"> = {}) {
    const params = new URLSearchParams({ view: "map" });
    if (query.categorySlug) params.set("categorySlug", query.categorySlug);
    if (query.provinceSlug) params.set("provinceSlug", query.provinceSlug);
    if (query.tagSlug) params.set("tagSlug", query.tagSlug);
    return api.get<ApiResponse<StoryMapPoint[]>>(`/api/stories?${params.toString()}`);
  },

  getBySlug(provinceSlug: string, storySlug: string) {
    return api.get<ApiResponse<StoryDetail>>(`/api/stories/${provinceSlug}/${storySlug}`);
  },

  create(payload: CreateStoryInput) {
    return api.post<ApiResponse<{ id: string; slug: string; status: string }>>(
      "/api/stories",
      payload,
    );
  },
};
