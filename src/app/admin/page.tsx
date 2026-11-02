import { Compass, Landmark, Sparkles } from "lucide-react";
import { listStories } from "@/api/stories/service";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";
import StorySection from "@/components/story/StorySection";
import { listStoriesQuerySchema } from "@/models/schemas";

export const dynamic = "force-dynamic";

/** Published stories for a row; an empty row if the database is unavailable. */
async function storiesFor(query: Record<string, string | number>) {
  try {
    return (await listStories(listStoriesQuerySchema.parse(query))).data;
  } catch {
    return [];
  }
}

export default async function RecommendedPlacesPage() {
  const [community, ghost, legend, local, heritage] = await Promise.all([
    storiesFor({ sort: "popular", limit: 8 }),
    storiesFor({ categorySlug: "ghost", limit: 2 }),
    storiesFor({ categorySlug: "legend", limit: 2 }),
    storiesFor({ categorySlug: "local", limit: 2 }),
    storiesFor({ categorySlug: "history", limit: 8 }),
  ]);

  return (
    <PageContainer width="wide" className="flex flex-col gap-16 sm:gap-20">
      <PageHero
        eyebrow="คัดสรร"
        title="สถานที่แนะนำ"
        description="จุดที่น่าเดินทางผ่านเรื่องเล่า — จะทยอยอัปเดตจากเรื่องที่เผยแพร่บนแผนที่"
        className="mb-0 sm:mb-0"
      />
      <StorySection
        index={1}
        icon={Sparkles}
        title="คัดจากชุมชน"
        description="จุดที่คนอ่านกลับไปบ่อย เรื่องที่ถูกเล่าต่อ และสถานที่ที่ยังมีชีวิต"
        stories={community}
      />
      <StorySection
        index={2}
        icon={Compass}
        title="เส้นทางสำรวจ"
        description="ชุดพิกัดที่เดินทางต่อกันได้ — จากลี้ลับ สู่ตำนาน แล้วลงที่เรื่องท้องถิ่น"
        stories={[...ghost, ...legend, ...local]}
        numbered
      />
      <StorySection
        index={3}
        icon={Landmark}
        title="มรดกและความทรงจำ"
        description="วัด เมืองเก่า อนุสาวรีย์ และพื้นที่ที่ประวัติศาสตร์ยังเกาะอยู่"
        stories={heritage}
      />
    </PageContainer>
  );
}
