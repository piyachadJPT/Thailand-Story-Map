import type { Metadata } from "next";
import ContributeCta from "@/components/contribute/ContributeCta";
import ContributeSteps from "@/components/contribute/ContributeSteps";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "ร่วมเล่าเรื่องบนแผนที่ — วิธีส่งเรื่องเล่าของคุณ",
  description:
    "ทุกจุดบนแผนที่มีเรื่องซ่อนอยู่ ส่งตำนาน เรื่องลี้ลับ ประวัติศาสตร์ หรือเรื่องท้องถิ่นของคุณ ปักหมุดบนสถานที่จริง แล้วให้คนอื่นได้เดินทางผ่านเรื่องนั้น",
  path: "/contribute",
});

export default function ContributePage() {
  return (
    <PageContainer className="flex flex-col gap-12 sm:gap-16">
      <PageHero
        eyebrow="ร่วมเล่า"
        title="เรื่องราวใหม่"
        description="ทุกจุดบนแผนที่มีเรื่องซ่อนอยู่ ส่งเรื่องของคุณให้คนอื่นได้เดินทางผ่านตำนาน ประวัติศาสตร์ และเรื่องใกล้ตัว"
        className="mb-0 sm:mb-0"
      />
      <ContributeSteps />
      <ContributeCta />
    </PageContainer>
  );
}
