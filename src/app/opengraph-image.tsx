import { siteConfig } from "@/config/site";
import { OG_CONTENT_TYPE, OG_SIZE, brandImage } from "@/lib/seo/og";

export const alt = `${siteConfig.nameTh} — ${siteConfig.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return brandImage({
    title: siteConfig.nameTh,
    subtitle: "ตำนาน เรื่องลี้ลับ ประวัติศาสตร์ และเรื่องท้องถิ่น ผูกกับสถานที่จริงทั่ว 77 จังหวัด",
  });
}
