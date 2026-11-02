import CategoryGrid from "@/components/category/CategoryGrid";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";

export default function CategoriesPage() {
  return (
    <PageContainer width="wide">
      <PageHero
        eyebrow="หมวดเรื่องเล่า"
        title="สำรวจ"
        description="เลือกหมวดแล้วเดินทางผ่านเรื่องลี้ลับ ประวัติศาสตร์ ตำนาน และเรื่องท้องถิ่นบนแผนที่ประเทศไทย"
      />
      <CategoryGrid />
    </PageContainer>
  );
}
