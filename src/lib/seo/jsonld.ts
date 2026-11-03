import { siteConfig } from "@/config/site";
import { cutAtWord, plainText, truncateThai } from "./text";
import { absoluteUrl } from "./url";

type Json = Record<string, unknown>;

const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

/**
 * JSON for a <script type="application/ld+json">. User text can contain
 * "</script>", so <, > and & are escaped as unicode (still valid JSON).
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Drops undefined, null, "" and empty arrays/objects so no placeholder fields are emitted. */
export function compact<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(compact).filter((item) => !isEmpty(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Json = {};
    for (const [key, item] of Object.entries(value)) {
      const cleaned = compact(item);
      if (!isEmpty(cleaned)) out[key] = cleaned;
    }
    return out as T;
  }
  return value;
}

function isEmpty(value: unknown) {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value as Json).length === 0;
  return false;
}

export function organizationJsonLd(): Json {
  return compact({
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    alternateName: siteConfig.nameTh,
    url: siteConfig.url,
    logo: absoluteUrl("/icon.png"),
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  });
}

/** No SearchAction: the site has no search results page that works from a URL. */
export function websiteJsonLd(): Json {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    alternateName: siteConfig.nameTh,
    url: siteConfig.url,
    inLanguage: "th",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function siteJsonLd(): Json {
  return { "@context": "https://schema.org", "@graph": [organizationJsonLd(), websiteJsonLd()] };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export type ArticleInput = {
  title: string;
  summary: string;
  path: string;
  images: string[];
  publishedAt: string;
  updatedAt: string;
  authorName?: string | null;
  categoryName: string;
  place: { provinceName: string; latitude: number; longitude: number };
};

export function articleJsonLd(input: ArticleInput): Json {
  const url = absoluteUrl(input.path);
  return compact({
    "@type": "Article",
    "@id": `${url}#article`,
    headline: cutAtWord(plainText(input.title), 110),
    description: truncateThai(input.summary, 300),
    image: input.images.map((image) => absoluteUrl(image)),
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: input.authorName ? { "@type": "Person", name: input.authorName } : undefined,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "th",
    articleSection: input.categoryName,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    contentLocation: {
      "@type": "Place",
      name: input.place.provinceName,
      geo: {
        "@type": "GeoCoordinates",
        latitude: input.place.latitude,
        longitude: input.place.longitude,
      },
      address: {
        "@type": "PostalAddress",
        addressRegion: input.place.provinceName,
        addressCountry: "TH",
      },
    },
  });
}

export type CollectionInput = {
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
};

export function collectionPageJsonLd(input: CollectionInput): Json {
  return compact({
    "@type": "CollectionPage",
    name: input.name,
    description: truncateThai(input.description, 300),
    url: absoluteUrl(input.path),
    inLanguage: "th",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: input.items.length
      ? {
          "@type": "ItemList",
          numberOfItems: input.items.length,
          itemListElement: input.items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: absoluteUrl(item.path),
          })),
        }
      : undefined,
  });
}

export function aboutPageJsonLd(input: { name: string; description: string; path: string }): Json {
  return {
    "@type": "AboutPage",
    name: input.name,
    description: truncateThai(input.description, 300),
    url: absoluteUrl(input.path),
    inLanguage: "th",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
  };
}

/** Wraps nodes in one @graph document. */
export function graph(...nodes: Json[]): Json {
  return { "@context": "https://schema.org", "@graph": nodes };
}
