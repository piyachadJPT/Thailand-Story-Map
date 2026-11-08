import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Feather, MapPin } from "lucide-react";
import { countByProvince, listPublishedStories } from "@/api/stories/public";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { categoryIcon, findCategory, type StoryCategory } from "@/config/categories";
import { breadcrumbJsonLd, collectionPageJsonLd, graph, type Crumb } from "@/lib/seo/jsonld";
import {
  categoryCanonical,
  categoryListingHref,
  DEFAULT_SORT,
  provinceListingHref,
  type ListingSort,
} from "@/lib/seo/listing";
import { buildMetadata } from "@/lib/seo/metadata";
import { categoryPath, storyPath } from "@/lib/seo/url";
import { findProvince } from "@/lib/thai-provinces";
import ListingPagination from "./ListingPagination";
import SortLinks from "./SortLinks";
import StoryGrid from "./StoryGrid";

export type CategoryListingParams = { slug: string; sort: ListingSort; page: number };

const loadCategoryListing = cache(async (slug: string, sort: ListingSort, page: number) => {
  const category = findCategory(slug);
  if (!category) notFound();
  const [list, provinceCounts] = await Promise.all([
    listPublishedStories({ categorySlug: slug, sort, page }),
    countByProvince(slug),
  ]);
  // Pages past the end do not exist (page 1 always does, even when empty).
  if (page > list.totalPages) notFound();
  const topProvinces = [...provinceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .flatMap(([provinceSlug, count]) => {
      const province = findProvince(provinceSlug);
      return province ? [{ ...province, count }] : [];
    });
  return { category, ...list, topProvinces };
});

function crumbs(category: StoryCategory): Crumb[] {
  return [
    { name: "หน้าแรก", path: "/" },
    { name: "สำรวจ", path: "/categories" },
    { name: category.name, path: categoryPath(category.slug) },
  ];
}

export async function categoryListingMetadata({ slug, sort, page }: CategoryListingParams): Promise<Metadata> {
  const { category, total } = await loadCategoryListing(slug, sort, page);
  const pageSuffix = page > 1 ? ` — หน้า ${page}` : "";
  return buildMetadata({
    title: `${category.seoTitle}${pageSuffix}`,
    description:
      total > 0
        ? `รวม ${total.toLocaleString("th-TH")} ${category.name}บนแผนที่ประเทศไทย — ${category.intro[0]}`
        : category.intro[0],
    path: categoryCanonical(slug, page),
    noindex: total === 0,
    follow: true,
    // The base URL uses this route's opengraph-image; query variants use the site image.
    image: sort === DEFAULT_SORT && page === 1 ? null : undefined,
  });
}

export default async function CategoryListing({ slug, sort, page }: CategoryListingParams) {
  const { category, stories, total, totalPages, topProvinces } = await loadCategoryListing(slug, sort, page);
  const Icon = categoryIcon(category.slug);
  const path = categoryCanonical(slug, page);

  return (
    <PageContainer width="wide" className="flex flex-col gap-12 sm:gap-14">
      <JsonLd
        data={graph(
          collectionPageJsonLd({
            name: category.seoTitle,
            description: category.intro.join(" "),
            path,
            items: stories.map((story) => ({ name: story.title, path: storyPath(story.provinceSlug, story.slug) })),
          }),
          breadcrumbJsonLd(crumbs(category))
        )}
      />
      <div className="space-y-6">
        <Breadcrumbs items={crumbs(category)} />
        <PageHero
          eyebrow={`หมวด${category.name.replace(/^เรื่อง/, "")} · ${total.toLocaleString("th-TH")} เรื่อง`}
          title={category.seoTitle}
          description={category.hint}
          className="mb-0 sm:mb-0"
        />
      </div>

      {page === 1 ? (
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          {category.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {topProvinces.length ? (
        <section aria-labelledby="top-provinces" className="space-y-5">
          <SectionHeading
            titleId="top-provinces"
            size="sm"
            title={`จังหวัดที่มี${category.name}มากที่สุด`}
            description="เลือกจังหวัดเพื่ออ่านเฉพาะเรื่องในหมวดนี้"
          />
          <ul className="flex flex-wrap gap-2">
            {topProvinces.map((province) => (
              <li key={province.slug}>
                <Chip asChild variant="outline" size="md">
                  <Link href={provinceListingHref(province.slug, { category: category.slug })}>
                    <MapPin aria-hidden="true" className="text-gold-ink" />
                    {province.name}
                    <span className="text-muted-foreground tabular-nums">
                      {province.count.toLocaleString("th-TH")}
                    </span>
                  </Link>
                </Chip>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="category-stories" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            titleId="category-stories"
            title={`${category.name}ทั้งหมด`}
            description={page > 1 ? `หน้า ${page} จาก ${totalPages}` : undefined}
          />
          {total > 1 ? (
            <SortLinks value={sort} href={(next) => categoryListingHref(slug, { sort: next })} />
          ) : null}
        </div>
        {stories.length ? (
          <>
            <StoryGrid stories={stories} label={`${category.name}ทั้งหมด`} />
            <ListingPagination
              page={page}
              totalPages={totalPages}
              href={(next) => categoryListingHref(slug, { sort, page: next })}
            />
          </>
        ) : (
          <EmptyState
            icon={Icon}
            headingLevel="h3"
            title={`ยังไม่มี${category.name}บนแผนที่`}
            text="เรื่องแรกของหมวดนี้อาจเป็นเรื่องของคุณ"
            action={
              <Link href="/contribute" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Feather aria-hidden="true" />
                ร่วมเล่าเรื่อง
              </Link>
            }
          />
        )}
      </section>
    </PageContainer>
  );
}
