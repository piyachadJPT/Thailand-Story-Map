import ContributeCta from "@/components/contribute/ContributeCta";
import ContributeSteps from "@/components/contribute/ContributeSteps";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";

export default function ContactPage() {
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
