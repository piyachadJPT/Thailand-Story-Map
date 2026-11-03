import { countPublishedStories } from "@/api/stories/public";
import { siteConfig } from "@/config/site";
import { brandImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og";
import { findProvince, provinceRecords } from "@/lib/thai-provinces";

export const alt = `เรื่องเล่าประจำจังหวัดบน ${siteConfig.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return provinceRecords.map((province) => ({ slug: province.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const province = findProvince(slug) ?? provinceRecords[0];
  const count = await countPublishedStories({ provinceSlug: province.slug }).catch(() => undefined);
  return brandImage({
    eyebrow: province.region,
    title: `เรื่องเล่า${province.name}`,
    subtitle: "ตำนาน เรื่องลี้ลับ ประวัติศาสตร์ และเรื่องท้องถิ่นที่ผูกกับสถานที่จริง",
    count,
  });
}
