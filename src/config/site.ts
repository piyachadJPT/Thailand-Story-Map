const DEV_URL = "http://localhost:3000";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

type SiteEnv = { NEXT_PUBLIC_APP_URL?: string; NODE_ENV?: string };

/**
 * Canonical site origin from NEXT_PUBLIC_APP_URL, without a trailing slash.
 * Production must set it (https): canonical URLs, sitemap and Open Graph depend on it.
 */
export function resolveSiteUrl(env: SiteEnv): string {
  const raw = env.NEXT_PUBLIC_APP_URL?.trim();
  const production = env.NODE_ENV === "production";
  if (!raw) {
    if (production) {
      throw new Error(
        "NEXT_PUBLIC_APP_URL is not set. Set it to the public site URL (e.g. https://example.com) " +
          "before building: canonical URLs, sitemap.xml and Open Graph images need it."
      );
    }
    return DEV_URL;
  }
  const url = new URL(raw);
  if (production && url.protocol !== "https:" && !LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(`NEXT_PUBLIC_APP_URL must use https in production (got ${url.origin}).`);
  }
  const path = url.pathname.replace(/\/+$/, "").toLowerCase();
  return `${url.origin}${path}`;
}

export const siteConfig = {
  name: "Thailand Story Map",
  nameTh: "แผนที่เรื่องเล่าประเทศไทย",
  shortName: "TSM",
  tagline: "เดินทางผ่านเรื่องเล่าทั่วไทย",
  description:
    "แผนที่รวมเรื่องเล่าทั่วประเทศไทย — เรื่องลี้ลับ ตำนานพื้นบ้าน ประวัติศาสตร์ คดีดัง และเรื่องท้องถิ่น ผูกกับสถานที่จริงทั้ง 77 จังหวัด อ่านฟรีและร่วมเล่าเรื่องของคุณได้",
  // Direct process.env reads so Next inlines them in client bundles too.
  url: resolveSiteUrl({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  }),
  locale: "th_TH",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || undefined,
  /** Official profiles, used in the footer and JSON-LD sameAs. Add them once they exist. */
  social: {} as Partial<Record<"facebook" | "x" | "instagram" | "tiktok", string>>,
};

export type SiteConfig = typeof siteConfig;
