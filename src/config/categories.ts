import {
  BookOpen,
  Compass,
  Ghost,
  Landmark,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export const storyCategories = [
  {
    name: "เรื่องลี้ลับ",
    slug: "ghost",
    hint: "ผี สิ่งลี้ลับ และเรื่องไม่ธรรมดาที่ผูกกับสถานที่",
  },
  {
    name: "ประวัติศาสตร์",
    slug: "history",
    hint: "เหตุการณ์ สถานที่ และบุคคลในอดีตของไทย",
  },
  {
    name: "ตำนานพื้นบ้าน",
    slug: "legend",
    hint: "นิทาน ตำนาน และความเชื่อที่เล่าขานในชุมชน",
  },
  {
    name: "คดีอาชญากรรม",
    slug: "crime",
    hint: "คดีดังและเรื่องจริงที่ยังถูกพูดถึง",
  },
  {
    name: "เรื่องเล่าท้องถิ่น",
    slug: "local",
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

export function categoryIcon(slug: string): LucideIcon {
  return icons[slug as keyof typeof icons] ?? Compass;
}

export type StoryCategory = (typeof storyCategories)[number];
