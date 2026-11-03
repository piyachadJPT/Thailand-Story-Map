import { siteConfig } from "@/config/site";

/** Full URL on this site for a path ("/story/…") — used for canonical, OG, sitemap, JSON-LD. */
export function absoluteUrl(path = "/", base = siteConfig.url): string {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? base : `${base}${clean}`;
}

/** Decodes a route param once; values that are not valid escapes are returned as-is. */
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Public story URL. The slug may be Thai, so it is always percent-encoded. */
export function storyPath(provinceSlug: string, slug: string): string {
  return `/story/${encodeURIComponent(provinceSlug)}/${encodeURIComponent(slug)}`;
}

/** Fixed URL of a story's Open Graph image. */
export function storyOgImagePath(provinceSlug: string, slug: string): string {
  return `/og${storyPath(provinceSlug, slug)}`;
}

export function categoryPath(slug: string): string {
  return `/categories/${encodeURIComponent(slug)}`;
}

export function provincePath(slug: string, query?: Record<string, string | number | undefined>): string {
  const path = `/province/${encodeURIComponent(slug)}`;
  return withQuery(path, query);
}

/** Adds non-empty query values in a stable order. */
export function withQuery(path: string, query?: Record<string, string | number | undefined>): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}
