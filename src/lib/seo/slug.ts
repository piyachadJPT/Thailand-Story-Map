import { cutAtWord } from "./text";

const MAX_BASE_LENGTH = 60;
const SUFFIX_LENGTH = 6;
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/** 6 random base36 characters; keeps slugs unique without a lookup. */
export function randomSlugSuffix(length = SUFFIX_LENGTH): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

/** Readable part of a slug: Thai letters, a–z and 0–9 joined by single dashes. */
export function slugBase(title: string): string {
  const base = title
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^฀-๿a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cutAtWord(base, MAX_BASE_LENGTH).replace(/-+$/g, "");
}

/**
 * Story slug from its title, e.g. "ตำนานพญานาค-แม่น้ำโขง-k3x9qa".
 * Titles with nothing usable (emoji only, …) become "story-<id>".
 */
export function createStorySlug(title: string, suffix = randomSlugSuffix()): string {
  const base = slugBase(title);
  return base ? `${base}-${suffix}` : `story-${suffix}`;
}

/** Slugs created before readable slugs existed. */
export const LEGACY_SLUG = /^story-\d+$/;
