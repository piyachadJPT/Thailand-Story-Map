import type { Prisma } from "@prisma/client";
import { storyRouteInfo } from "@/api/stories/public";
import { revalidateStory } from "./revalidate";

/** Looks up the stories' current URLs and revalidates their pages (backoffice actions). */
export async function revalidateStoriesWhere(where: Prisma.StoryWhereInput) {
  try {
    const stories = await storyRouteInfo(where);
    for (const story of stories) {
      revalidateStory({
        provinceSlug: story.province.slug,
        slug: story.slug,
        categorySlug: story.category.slug,
      });
    }
  } catch (error) {
    console.error("[revalidate] lookup failed", error);
  }
}
