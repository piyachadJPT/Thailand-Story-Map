import { isCategorySlug, type CategorySlug } from "@/config/categories";
import { categoryPath, provincePath, withQuery } from "./url";

export type ListingSort = "recent" | "popular";
export const DEFAULT_SORT: ListingSort = "recent";
/** A filtered province page is its own canonical page only with this many stories. */
export const MIN_FILTERED_STORIES = 3;

/**
 * Query URLs (?page=, ?sort=, ?category=) are rewritten in next.config.ts to
 * internal static paths (/…/v/<sort>/<page>), so every listing stays ISR-cached.
 * These parse the internal path segments; anything unexpected is a 404.
 */
export function parseSort(value: string): ListingSort | null {
  return value === "recent" || value === "popular" ? value : null;
}

export function parsePage(value: string): number | null {
  if (!/^[1-9]\d{0,4}$/.test(value)) return null;
  return Number(value);
}

export function parseCategoryFilter(value: string): CategorySlug | "all" | null {
  if (value === "all") return "all";
  return isCategorySlug(value) ? value : null;
}

/** Public URL of a category listing (what users, crawlers and canonical see). */
export function categoryListingHref(slug: string, opts: { sort?: ListingSort; page?: number } = {}) {
  return withQuery(categoryPath(slug), {
    sort: opts.sort && opts.sort !== DEFAULT_SORT ? opts.sort : undefined,
    page: opts.page && opts.page > 1 ? opts.page : undefined,
  });
}

export function provinceListingHref(
  slug: string,
  opts: { category?: string; sort?: ListingSort; page?: number } = {}
) {
  return provincePath(slug, {
    category: opts.category && opts.category !== "all" ? opts.category : undefined,
    sort: opts.sort && opts.sort !== DEFAULT_SORT ? opts.sort : undefined,
    page: opts.page && opts.page > 1 ? opts.page : undefined,
  });
}

/** Canonical: page kept, sort dropped. */
export function categoryCanonical(slug: string, page: number) {
  return categoryListingHref(slug, { page });
}

/** Canonical: the category filter stays only when it has enough stories to stand alone. */
export function provinceCanonical(slug: string, category: string, page: number, filteredTotal: number) {
  const keepCategory = category !== "all" && filteredTotal >= MIN_FILTERED_STORIES;
  return provinceListingHref(slug, {
    category: keepCategory ? category : undefined,
    page: keepCategory || category === "all" ? page : undefined,
  });
}
