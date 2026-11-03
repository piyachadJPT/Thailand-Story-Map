import { revalidatePath } from "next/cache";
import { categoryPath, provincePath, storyOgImagePath, storyPath } from "./url";

export type StoryRoute = {
  provinceSlug: string;
  slug: string;
  categorySlug: string;
  oldProvinceSlug?: string;
  oldCategorySlug?: string;
};

/** Every cached page that shows a story, so it updates right after a change. */
export function storyPagePaths(route: StoryRoute): string[] {
  const story = storyPath(route.provinceSlug, route.slug);
  const paths = [
    story,
    // Thai slugs: the cache may be keyed by either form of the path.
    decodeURI(story),
    storyOgImagePath(route.provinceSlug, route.slug),
    provincePath(route.provinceSlug),
    categoryPath(route.categorySlug),
    "/province",
    "/places",
    "/sitemap.xml",
  ];
  if (route.oldProvinceSlug && route.oldProvinceSlug !== route.provinceSlug) {
    paths.push(provincePath(route.oldProvinceSlug));
    paths.push(storyPath(route.oldProvinceSlug, route.slug));
  }
  if (route.oldCategorySlug && route.oldCategorySlug !== route.categorySlug) {
    paths.push(categoryPath(route.oldCategorySlug));
  }
  return [...new Set(paths)];
}

/**
 * Revalidates story, province, category and listing pages. Paginated and
 * filtered variants are refreshed by the "layout" revalidation of their base.
 * Never throws: a failed revalidation must not fail the user's action.
 */
export function revalidateStory(route: StoryRoute) {
  for (const path of storyPagePaths(route)) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.error("[revalidate]", path, error);
    }
  }
  for (const base of [provincePath(route.provinceSlug), categoryPath(route.categorySlug)]) {
    try {
      revalidatePath(base, "layout");
    } catch (error) {
      console.error("[revalidate]", base, error);
    }
  }
}
