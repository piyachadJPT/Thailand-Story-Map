import type { Metadata } from "next";
import { Compass, Landmark, Sparkles } from "lucide-react";
import { listStories } from "@/api/stories/service";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";
import StorySection from "@/components/story/StorySection";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, collectionPageJsonLd, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { storyPath } from "@/lib/seo/url";
import { listStoriesQuerySchema } from "@/models/schemas";

// Nothing here depends on the visitor: cached and refreshed hourly or after story changes.
export const revalidate = 3600;

const description =
  "จุดที่น่าเดินทางผ่านเรื่องเล่า — จะทยอยอัปเดตจากเรื่องที่เผยแพร่บนแผนที่";

export const metadata: Metadata = buildMetadata({
  title: "สถานที่แนะนำ — เรื่องเล่ายอดนิยมและเส้นทางสำรวจทั่วไทย",
  description:
    "สถานที่ที่คนอ่านกลับไปบ่อย เส้นทางสำรวจจากเรื่องลี้ลับสู่ตำนาน และมรดกประวัติศาสตร์ที่ยังมีเรื่องเล่า คัดจากเรื่องที่เผยแพร่บนแผนที่ประเทศไทย",
  path: "/places",
});

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

  const listed = [...new Map([...community, ...ghost, ...legend, ...local, ...heritage].map((s) => [s.id, s])).values()];

  return (
    <PageContainer width="wide" className="flex flex-col gap-16 sm:gap-20">
      <JsonLd
        data={graph(
          collectionPageJsonLd({
            name: "สถานที่แนะนำ",
            description,
            path: "/places",
            items: listed.map((story) => ({ name: story.title, path: storyPath(story.provinceSlug, story.slug) })),
          }),
          breadcrumbJsonLd([
            { name: "หน้าแรก", path: "/" },
            { name: "สถานที่แนะนำ", path: "/places" },
          ])
        )}
      />
      <PageHero
        eyebrow="คัดสรร"
        title="สถานที่แนะนำ"
        description={description}
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
