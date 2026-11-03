import type { MetadataRoute } from "next";
import { isIndexable } from "./env";
import { absoluteUrl } from "./url";

/**
 * Production: everything except the API. Private pages (login, my stories, edit)
 * stay crawlable on purpose so crawlers can read their noindex tag; the
 * backoffice is never named here. Everywhere else: nothing is crawlable.
 */
export function buildRobots(indexable = isIndexable()): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
