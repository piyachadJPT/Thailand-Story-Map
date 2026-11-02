import {
  BookOpen,
  Compass,
  Ghost,
  Landmark,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for categories.
 * `colorToken` maps to Tailwind classes (bg-cat-ghost, text-cat-ghost, …).
 * `color` is the CSS value for dynamic styles such as map markers.
 */
export const storyCategories = [
  {
    name: "เรื่องลี้ลับ",
    slug: "ghost",
    colorToken: "cat-ghost",
    color: "var(--cat-ghost)",
    hint: "ผี สิ่งลี้ลับ และเรื่องไม่ธรรมดาที่ผูกกับสถานที่",
  },
  {
    name: "ประวัติศาสตร์",
    slug: "history",
    colorToken: "cat-history",
    color: "var(--cat-history)",
    hint: "เหตุการณ์ สถานที่ และบุคคลในอดีตของไทย",
  },
  {
    name: "ตำนานพื้นบ้าน",
    slug: "legend",
    colorToken: "cat-legend",
    color: "var(--cat-legend)",
    hint: "นิทาน ตำนาน และความเชื่อที่เล่าขานในชุมชน",
  },
  {
    name: "คดีอาชญากรรม",
    slug: "crime",
    colorToken: "cat-crime",
    color: "var(--cat-crime)",
    hint: "คดีดังและเรื่องจริงที่ยังถูกพูดถึง",
  },
  {
    name: "เรื่องเล่าท้องถิ่น",
    slug: "local",
    colorToken: "cat-local",
    color: "var(--cat-local)",
    hint: "ชีวิต วิถี และเรื่องใกล้ตัวตามแต่ละจังหวัด",
  },
] as const;

const icons: Record<(typeof storyCategories)[number]["slug"], LucideIcon> = {
  ghost: Ghost,
  history: Landmark,
  legend: BookOpen,
  crime: ShieldAlert,
  local: Compass,
};

export type StoryCategory = (typeof storyCategories)[number];
export type CategorySlug = StoryCategory["slug"];

export function isCategorySlug(slug: string): slug is CategorySlug {
  return storyCategories.some((category) => category.slug === slug);
}

export function categoryIcon(slug: string): LucideIcon {
  return icons[slug as keyof typeof icons] ?? Compass;
}

/** Theme-aware CSS color for a category; falls back to the gold accent. */
export function categoryColor(slug: string): string {
  return (
    storyCategories.find((category) => category.slug === slug)?.color ??
    "var(--gold)"
  );
}
