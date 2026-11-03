import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { truncateThai } from "./text";
import { absoluteUrl } from "./url";

export const DESCRIPTION_LENGTH = 155;

export type SeoImage = { url: string; width?: number; height?: number; alt: string };

/** src/app/opengraph-image.tsx — the site-wide share image. */
export const DEFAULT_OG_IMAGE: SeoImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteConfig.nameTh} — ${siteConfig.tagline}`,
};

export type BuildMetadataInput = {
  /** Page title without the site name; the root layout template adds it. */
  title: string;
  description: string;
  /** Canonical path ("/categories/ghost?page=2"). */
  path: string;
  /** Use the title as-is, without the "| Thailand Story Map" template (home page). */
  absoluteTitle?: boolean;
  /**
   * OG image; defaults to the site image. `null` emits none, so the route's own
   * opengraph-image file is used (page config would otherwise override it).
   */
  image?: SeoImage | null;
  noindex?: boolean;
  /** With noindex: still let crawlers follow links (empty listing pages). */
  follow?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  authors?: string[];
};

/** Strips a trailing "| Thailand Story Map" / "| TSM" so the template never doubles it. */
function cleanTitle(title: string) {
  const suffix = new RegExp(`\\s*[|–—-]\\s*(${siteConfig.name}|${siteConfig.shortName})\\s*$`, "i");
  return title.replace(suffix, "").trim();
}

/** Complete per-page metadata: title, description, canonical, Open Graph and Twitter card. */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const title = cleanTitle(input.title);
  const description = truncateThai(input.description, DESCRIPTION_LENGTH);
  const url = absoluteUrl(input.path);
  const socialTitle = input.absoluteTitle ? title : `${title} | ${siteConfig.name}`;
  const image = input.image === undefined ? DEFAULT_OG_IMAGE : input.image;
  const images = image ? [{ ...image, url: absoluteUrl(image.url) }] : undefined;
  const article =
    input.type === "article"
      ? {
          publishedTime: input.publishedTime,
          modifiedTime: input.modifiedTime,
          section: input.section,
          authors: input.authors?.filter(Boolean),
        }
      : {};

  return {
    title: input.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: input.type ?? "website",
      url,
      title: socialTitle,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...(images ? { images } : {}),
      ...article,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      ...(images ? { images: images.map((item) => item.url) } : {}),
    },
    ...(input.noindex
      ? { robots: { index: false, follow: input.follow ?? false } }
      : {}),
  };
}

/** Private pages (login, my stories, edit): never indexed, links not followed. */
export const privatePageRobots: Metadata["robots"] = { index: false, follow: false };
