import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Feather, MapPin } from "lucide-react";
import {
  countByCategory,
  countByProvince,
  listProvincePoints,
  listPublishedStories,
} from "@/api/stories/public";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { categoryIcon, findCategory, storyCategories } from "@/config/categories";
import { getMapboxToken } from "@/config/mapbox";
import { breadcrumbJsonLd, collectionPageJsonLd, graph, type Crumb } from "@/lib/seo/jsonld";
import {
  DEFAULT_SORT,
  provinceCanonical,
  provinceListingHref,
  type ListingSort,
} from "@/lib/seo/listing";
import { buildMetadata } from "@/lib/seo/metadata";
import { provincePath, storyPath } from "@/lib/seo/url";
import { regionLai } from "@/lib/region-pattern";
import { findProvince, provinceRecords, type ProvinceRecord } from "@/lib/thai-provinces";
import ListingPagination from "./ListingPagination";
import ProvinceStoryMap from "./ProvinceStoryMap";
import SortLinks from "./SortLinks";
import StoryGrid from "./StoryGrid";

export type ProvinceListingParams = {
  slug: string;
  /** Category slug or "all". */
  category: string;
  sort: ListingSort;
  page: number;
};

const loadProvinceListing = cache(async (slug: string, category: string, sort: ListingSort, page: number) => {
  const province = findProvince(slug);
  if (!province) notFound();
  const categorySlug = category === "all" ? undefined : category;
  const [list, categoryCounts, provinceCounts, points] = await Promise.all([
    listPublishedStories({ provinceSlug: slug, categorySlug, sort, page }),
    countByCategory(slug),
    countByProvince(),
    listProvincePoints(slug),
  ]);
  if (page > list.totalPages) notFound();
  const provinceTotal = provinceCounts.get(slug) ?? 0;
  const neighbors = provinceRecords
    .filter((item) => item.region === province.region && item.slug !== slug && provinceCounts.get(item.slug))
    .map((item) => ({ ...item, count: provinceCounts.get(item.slug) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  return { province, ...list, categoryCounts, provinceTotal, neighbors, points };
});

function crumbs(province: ProvinceRecord): Crumb[] {
  return [
    { name: "หน้าแรก", path: "/" },
    { name: "77 จังหวัด", path: "/province" },
    { name: province.name, path: provincePath(province.slug) },
  ];
}

/** "รวม 23 เรื่องเล่าในเชียงใหม่ (ภาคเหนือ) — เรื่องลี้ลับ 8 เรื่อง, …" from real counts only. */
function summaryOf(province: ProvinceRecord, total: number, counts: Map<string, number>) {
  if (total === 0) {
    return `ยังไม่มีเรื่องเล่าใน${province.name} (${province.region}) บนแผนที่ — เป็นคนแรกที่เล่าเรื่องของจังหวัดนี้`;
  }
  const parts = storyCategories
    .filter((category) => counts.get(category.slug))
    .map((category) => `${category.name} ${counts.get(category.slug)!.toLocaleString("th-TH")} เรื่อง`);
  return `รวม ${total.toLocaleString("th-TH")} เรื่องเล่าใน${province.name} (${province.region}) — ${parts.join(", ")}`;
}

export async function provinceListingMetadata({ slug, category, sort, page }: ProvinceListingParams): Promise<Metadata> {
  const { province, total, provinceTotal, categoryCounts } = await loadProvinceListing(slug, category, sort, page);
  const filter = findCategory(category);
  const pageSuffix = page > 1 ? ` — หน้า ${page}` : "";
  const title = filter
    ? `${filter.name}${province.name}${pageSuffix}`
    : `เรื่องเล่า${province.name} — ตำนาน เรื่องลี้ลับ ประวัติศาสตร์${pageSuffix}`;
  return buildMetadata({
    title,
    description: summaryOf(province, provinceTotal, categoryCounts),
    path: provinceCanonical(slug, category, page, total),
    // Empty provinces are shown but not indexed until their first story.
    noindex: total === 0,
    follow: true,
    // The base URL uses this route's opengraph-image; query variants use the site image.
    image: category === "all" && sort === DEFAULT_SORT && page === 1 ? null : undefined,
  });
}

export default async function ProvinceListing({ slug, category, sort, page }: ProvinceListingParams) {
  const data = await loadProvinceListing(slug, category, sort, page);
  const { province, stories, total, totalPages, categoryCounts, provinceTotal, neighbors, points } = data;
  const filter = findCategory(category);
  const heading = filter ? `${filter.name}ใน${province.name}` : `เรื่องเล่าทั้งหมดใน${province.name}`;

  return (
    <PageContainer width="wide" className="flex flex-col gap-12 sm:gap-14">
      <JsonLd
        data={graph(
          collectionPageJsonLd({
            name: `เรื่องเล่า${province.name}`,
            description: summaryOf(province, provinceTotal, categoryCounts),
            path: provinceCanonical(slug, category, page, total),
            items: stories.map((story) => ({ name: story.title, path: storyPath(story.provinceSlug, story.slug) })),
          }),
          breadcrumbJsonLd(crumbs(province))
        )}
      />
      <div className="space-y-6">
        <Breadcrumbs items={crumbs(province)} />
        <PageHero
          eyebrow={province.region}
          mark={regionLai(province.region)}
          title={`เรื่องเล่า${province.name}`}
          description={summaryOf(province, provinceTotal, categoryCounts)}
          className="mb-0 sm:mb-0"
        />
      </div>

      {provinceTotal === 0 ? (
        <EmptyState
          icon={MapPin}
          headingLevel="h2"
          title={`เป็นคนแรกที่เล่าเรื่อง${province.name}`}
          text={`ยังไม่มีเรื่องเล่าที่ปักหมุดใน${province.name} ถ้าคุณรู้ตำนาน เรื่องลี้ลับ หรือความทรงจำของที่นี่ ร่วมเล่าได้เลย`}
          action={
            <Link href="/?compose=1" prefetch={false} className={buttonVariants()}>
              <Feather aria-hidden="true" />
              เขียนเรื่องแรกของ{province.name}
            </Link>
          }
        />
      ) : (
        <>
          <ProvinceStoryMap
            token={getMapboxToken()}
            provinceName={province.name}
            points={points.map((point) => ({
              id: point.id,
              title: point.title,
              href: storyPath(slug, point.slug),
              latitude: point.latitude,
              longitude: point.longitude,
              categorySlug: point.category.slug,
            }))}
          />

          <section aria-labelledby="province-stories" className="space-y-6">
            <SectionHeading
              titleId="province-stories"
              title={heading}
              description={page > 1 ? `หน้า ${page} จาก ${totalPages}` : undefined}
            />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <nav aria-label="กรองตามหมวด" className="flex flex-wrap gap-2">
                <Chip asChild variant="outline" size="md" data-selected={!filter}>
                  <Link href={provinceListingHref(slug, { sort })} aria-current={!filter ? "true" : undefined}>
                    ทั้งหมด
                    <span className="text-muted-foreground tabular-nums">{provinceTotal.toLocaleString("th-TH")}</span>
                  </Link>
                </Chip>
                {storyCategories
                  .filter((item) => categoryCounts.get(item.slug) || item.slug === category)
                  .map((item) => {
                    const Icon = categoryIcon(item.slug);
                    const active = item.slug === category;
                    return (
                      <Chip
                        key={item.slug}
                        asChild
                        size="md"
                        category={item.slug}
                        data-selected={active}
                      >
                        <Link
                          href={provinceListingHref(slug, { category: item.slug, sort })}
                          aria-current={active ? "true" : undefined}
                        >
                          <Icon aria-hidden="true" />
                          {item.name}
                          <span className="text-muted-foreground tabular-nums">
                            {(categoryCounts.get(item.slug) ?? 0).toLocaleString("th-TH")}
                          </span>
                        </Link>
                      </Chip>
                    );
                  })}
              </nav>
              {total > 1 ? (
                <SortLinks value={sort} href={(next) => provinceListingHref(slug, { category, sort: next })} />
              ) : null}
            </div>
            {stories.length ? (
              <>
                <StoryGrid stories={stories} label={heading} />
                <ListingPagination
                  page={page}
                  totalPages={totalPages}
                  href={(next) => provinceListingHref(slug, { category, sort, page: next })}
                />
              </>
            ) : (
              <EmptyState
                icon={filter ? categoryIcon(filter.slug) : MapPin}
                title={`ยังไม่มี${filter?.name ?? "เรื่องเล่า"}ใน${province.name}`}
                action={
                  <Link href={provinceListingHref(slug)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    ดูเรื่องทั้งหมดใน{province.name}
                  </Link>
                }
              />
            )}
          </section>
        </>
      )}

      {neighbors.length ? (
        <section aria-labelledby="nearby-provinces" className="space-y-5">
          <SectionHeading
            titleId="nearby-provinces"
            size="sm"
            title={`จังหวัดใกล้เคียงใน${province.region}`}
          />
          <ul className="flex flex-wrap gap-2">
            {neighbors.map((item) => (
              <li key={item.slug}>
                <Chip asChild variant="outline" size="md">
                  <Link href={provincePath(item.slug)}>
                    <MapPin aria-hidden="true" className="text-gold-ink" />
                    {item.name}
                    <span className="text-muted-foreground tabular-nums">{item.count.toLocaleString("th-TH")}</span>
                  </Link>
                </Chip>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageContainer>
  );
}
