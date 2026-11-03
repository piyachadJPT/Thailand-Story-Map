import type { NextConfig } from "next";
import { BACKOFFICE_PATH } from "./src/config/backoffice";
import { isIndexable } from "./src/lib/seo/env";

/** Backoffice pages and admin APIs: never indexed, cached, framed, or leaked via Referer. */
const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "no-store" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Frame-Options", value: "DENY" },
];

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error(
    "NEXT_PUBLIC_APP_URL is not set. Set it to the public site URL (e.g. https://example.com): " +
      "canonical URLs, sitemap.xml and Open Graph images need it."
  );
}

const CATEGORY = "(?<category>ghost|history|legend|crime|local)";
const SORT = "(?<sort>recent|popular)";
const PAGE = "(?<page>[1-9][0-9]{0,4})";
const q = (key: string, value: string) => ({ type: "query" as const, key, value });

/**
 * Listing query URLs (?page=, ?sort=, ?category=) → internal static paths, so
 * paginated and filtered listings are ISR-cached instead of rendered per request.
 * Most specific first; the visible URL (and canonical) keeps the query string.
 */
const listingRewrites = [
  { source: "/categories/:slug", has: [q("sort", SORT), q("page", PAGE)], destination: "/categories/:slug/v/:sort/:page" },
  { source: "/categories/:slug", has: [q("page", PAGE)], destination: "/categories/:slug/v/recent/:page" },
  { source: "/categories/:slug", has: [q("sort", SORT)], destination: "/categories/:slug/v/:sort/1" },
  { source: "/province/:slug", has: [q("category", CATEGORY), q("sort", SORT), q("page", PAGE)], destination: "/province/:slug/v/:category/:sort/:page" },
  { source: "/province/:slug", has: [q("category", CATEGORY), q("sort", SORT)], destination: "/province/:slug/v/:category/:sort/1" },
  { source: "/province/:slug", has: [q("category", CATEGORY), q("page", PAGE)], destination: "/province/:slug/v/:category/recent/:page" },
  { source: "/province/:slug", has: [q("sort", SORT), q("page", PAGE)], destination: "/province/:slug/v/all/:sort/:page" },
  { source: "/province/:slug", has: [q("category", CATEGORY)], destination: "/province/:slug/v/:category/recent/1" },
  { source: "/province/:slug", has: [q("sort", SORT)], destination: "/province/:slug/v/all/:sort/1" },
  { source: "/province/:slug", has: [q("page", PAGE)], destination: "/province/:slug/v/all/recent/:page" },
];

/** Previews and staging: never indexed, even if a page is linked from somewhere. */
const noindexHeaders = isIndexable()
  ? []
  : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["mapbox-gl"],
  // Files read from disk by the Open Graph image routes (src/lib/seo/og.tsx).
  outputFileTracingIncludes: {
    "/opengraph-image": ["./src/assets/fonts/KanitOG-*.ttf", "./src/app/icon.png"],
    "/**/opengraph-image*": ["./src/assets/fonts/KanitOG-*.ttf", "./src/app/icon.png"],
    "/og/**": ["./src/assets/fonts/KanitOG-*.ttf", "./src/app/icon.png"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**.r2.dev", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      { source: BACKOFFICE_PATH, headers: privateHeaders },
      { source: `${BACKOFFICE_PATH}/:path*`, headers: privateHeaders },
      { source: "/api/admin/:path*", headers: privateHeaders },
      ...noindexHeaders,
    ];
  },
  async rewrites() {
    return { beforeFiles: listingRewrites, afterFiles: [], fallback: [] };
  },
  async redirects() {
    return [
      { source: "/contact", destination: "/contribute", permanent: true },
      // A category filtered by province is the province page filtered by category.
      {
        source: "/categories/:slug",
        has: [q("province", "(?<province>[a-z-]+)")],
        destination: "/province/:province?category=:slug",
        permanent: true,
      },
      { source: "/en", destination: "/", permanent: false },
      { source: "/th", destination: "/", permanent: false },
      { source: "/en/:path*", destination: "/:path*", permanent: false },
      { source: "/th/:path*", destination: "/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
