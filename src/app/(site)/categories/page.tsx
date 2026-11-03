import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import CategoryGrid from "@/components/category/CategoryGrid";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { storyCategories } from "@/config/categories";
import { breadcrumbJsonLd, collectionPageJsonLd, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { categoryPath } from "@/lib/seo/url";

const description =
  "เลือกหมวดแล้วเดินทางผ่านเรื่องลี้ลับ ประวัติศาสตร์ ตำนาน และเรื่องท้องถิ่นบนแผนที่ประเทศไทย";

export const metadata: Metadata = buildMetadata({
  title: "สำรวจเรื่องเล่าตามหมวด — เรื่องลี้ลับ ตำนาน ประวัติศาสตร์ คดีดัง เรื่องท้องถิ่น",
  description: `${description} อ่านเรื่องเล่าที่ผูกกับสถานที่จริงทั่ว 77 จังหวัด`,
  path: "/categories",
});

export default function CategoriesPage() {
  return (
    <PageContainer width="wide">
      <JsonLd
        data={graph(
          collectionPageJsonLd({
            name: "สำรวจเรื่องเล่าตามหมวด",
            description,
            path: "/categories",
            items: storyCategories.map((category) => ({ name: category.seoTitle, path: categoryPath(category.slug) })),
          }),
          breadcrumbJsonLd([
            { name: "หน้าแรก", path: "/" },
            { name: "สำรวจ", path: "/categories" },
          ])
        )}
      />
      <PageHero
        eyebrow="หมวดเรื่องเล่า"
        title="สำรวจ"
        description={description}
        actions={
          <Link href="/province" className={buttonVariants({ variant: "outline" })}>
            <MapPin aria-hidden="true" />
            เลือกตามจังหวัด
          </Link>
        }
      />
      <CategoryGrid />
    </PageContainer>
  );
}
