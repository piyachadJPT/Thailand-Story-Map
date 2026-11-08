import type { Metadata } from "next";
import Link from "next/link";
import { countByProvince } from "@/api/stories/public";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/ui/section-heading";
import { breadcrumbJsonLd, collectionPageJsonLd, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { provincePath } from "@/lib/seo/url";
import { provinceRecords, regionOrder } from "@/lib/thai-provinces";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

const title = "เรื่องเล่าทั่ว 77 จังหวัด";
const description =
  "เลือกจังหวัดเพื่ออ่านตำนาน เรื่องลี้ลับ ประวัติศาสตร์ และเรื่องท้องถิ่นที่ผูกกับสถานที่จริง จัดกลุ่มตามภาคทั่วประเทศไทย";
const crumbs = [
  { name: "หน้าแรก", path: "/" },
  { name: "77 จังหวัด", path: "/province" },
];

export const metadata: Metadata = buildMetadata({
  title: "เรื่องเล่าทั่ว 77 จังหวัดของประเทศไทย",
  description,
  path: "/province",
});

export default async function ProvincesPage() {
  const counts = await countByProvince();
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const withStories = provinceRecords.filter((province) => counts.get(province.slug));

  return (
    <PageContainer width="wide" className="flex flex-col gap-12 sm:gap-14">
      <JsonLd
        data={graph(
          collectionPageJsonLd({
            name: title,
            description,
            path: "/province",
            items: withStories.map((province) => ({ name: `เรื่องเล่า${province.name}`, path: provincePath(province.slug) })),
          }),
          breadcrumbJsonLd(crumbs)
        )}
      />
      <div className="space-y-6">
        <Breadcrumbs items={crumbs} />
        <PageHero
          eyebrow={`${total.toLocaleString("th-TH")} เรื่อง · ${withStories.length.toLocaleString("th-TH")} จังหวัดที่มีเรื่องแล้ว`}
          title={title}
          description={description}
          className="mb-0 sm:mb-0"
        />
      </div>
      {regionOrder.map((region, index) => {
        const provinces = provinceRecords
          .filter((province) => province.region === region)
          .sort((a, b) => a.name.localeCompare(b.name, "th"));
        return (
          <section key={region} aria-labelledby={`region-${index}`} className="space-y-5">
            <SectionHeading titleId={`region-${index}`} size="sm" title={region} />
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {provinces.map((province) => {
                const count = counts.get(province.slug) ?? 0;
                return (
                  <li key={province.slug}>
                    <Link
                      href={provincePath(province.slug)}
                      className={cn(
                        "flex min-h-11 items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors hover:border-gold/60 focus-visible:ring-3 focus-visible:ring-ring/40",
                        count === 0 && "bg-transparent text-muted-foreground"
                      )}
                    >
                      <span className={cn("truncate", count > 0 && "font-medium text-foreground")}>
                        {province.name}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {count > 0 ? `${count.toLocaleString("th-TH")} เรื่อง` : "ยังไม่มี"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </PageContainer>
  );
}
