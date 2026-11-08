import { Prisma, StoryStatus } from "@prisma/client";
import { prisma } from "@/api/db/prisma";
import type { StoryListItem } from "@/models/types/story";

/** Read-only queries for public, cached pages (story, category, province, sitemap). */

const listSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  latitude: true,
  longitude: true,
  viewCount: true,
  status: true,
  createdAt: true,
  author: { select: { name: true } },
  category: { select: { slug: true, color: true } },
  province: { select: { slug: true } },
  images: { take: 1, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { url: true } },
} satisfies Prisma.StorySelect;

type ListRow = Prisma.StoryGetPayload<{ select: typeof listSelect }>;

export function toListItem(row: ListRow): StoryListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    latitude: row.latitude,
    longitude: row.longitude,
    viewCount: row.viewCount,
    categorySlug: row.category.slug,
    categoryColor: row.category.color,
    provinceSlug: row.province.slug,
    status: row.status,
    coverUrl: row.images[0]?.url ?? null,
    authorName: row.author.name,
    createdAt: row.createdAt.toISOString(),
  };
}

const detailInclude = {
  category: { select: { slug: true, name: true, color: true } },
  province: { select: { slug: true, name: true, region: true } },
  author: { select: { id: true, name: true, image: true } },
  images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
  tags: { include: { tag: true } },
} satisfies Prisma.StoryInclude;

export type PublishedStory = NonNullable<Awaited<ReturnType<typeof findStoryBySlug>>>;

function findStoryBySlug(slug: string) {
  return prisma.story.findUnique({ where: { slug }, include: detailInclude });
}

export type StoryLookup =
  | { kind: "story"; story: PublishedStory }
  | { kind: "redirect"; path: { provinceSlug: string; slug: string } }
  | { kind: "missing" };

/**
 * Resolves /story/:province/:slug. Slugs are unique, so the province in the URL
 * only has to match for the URL to be canonical; otherwise (or for an old slug)
 * the caller redirects permanently. Unpublished stories are missing.
 */
export async function lookupStory(provinceSlug: string, slug: string): Promise<StoryLookup> {
  const story = await findStoryBySlug(slug);
  if (story) {
    if (story.status !== StoryStatus.APPROVED) return { kind: "missing" };
    if (story.province.slug !== provinceSlug) {
      return { kind: "redirect", path: { provinceSlug: story.province.slug, slug: story.slug } };
    }
    return { kind: "story", story };
  }
  const redirect = await prisma.storySlugRedirect.findUnique({
    where: { oldSlug: slug },
    select: { story: { select: { slug: true, status: true, province: { select: { slug: true } } } } },
  });
  if (!redirect || redirect.story.status !== StoryStatus.APPROVED) return { kind: "missing" };
  return { kind: "redirect", path: { provinceSlug: redirect.story.province.slug, slug: redirect.story.slug } };
}

/** "More in <province>" and "More <category>" — no duplicates, never the current story. */
export async function listRelatedStories(
  story: { id: string; provinceId: string; categoryId: string },
  limit = 4
) {
  const orderBy = [{ viewCount: "desc" }, { createdAt: "desc" }, { id: "asc" }] satisfies Prisma.StoryOrderByWithRelationInput[];
  // Both lists in parallel. The category list over-fetches by `limit` so it still
  // has enough rows after dropping stories already shown in the province list.
  const [sameProvince, categoryRows] = await Promise.all([
    prisma.story.findMany({
      where: { status: StoryStatus.APPROVED, provinceId: story.provinceId, id: { not: story.id } },
      select: listSelect,
      orderBy,
      take: limit,
    }),
    prisma.story.findMany({
      where: { status: StoryStatus.APPROVED, categoryId: story.categoryId, id: { not: story.id } },
      select: listSelect,
      orderBy,
      take: limit * 2,
    }),
  ]);
  const shown = new Set(sameProvince.map((row) => row.id));
  const sameCategory = categoryRows.filter((row) => !shown.has(row.id)).slice(0, limit);
  return { sameProvince: sameProvince.map(toListItem), sameCategory: sameCategory.map(toListItem) };
}

export const PAGE_SIZE = 12;
export type ListingSort = "recent" | "popular";

export async function listPublishedStories(filter: {
  categorySlug?: string;
  provinceSlug?: string;
  sort: ListingSort;
  page: number;
  pageSize?: number;
}) {
  const pageSize = filter.pageSize ?? PAGE_SIZE;
  const where: Prisma.StoryWhereInput = {
    status: StoryStatus.APPROVED,
    ...(filter.categorySlug ? { category: { slug: filter.categorySlug } } : {}),
    ...(filter.provinceSlug ? { province: { slug: filter.provinceSlug } } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.story.findMany({
      where,
      select: listSelect,
      orderBy:
        filter.sort === "recent"
          ? [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }, { id: "asc" }]
          : [{ viewCount: "desc" }, { createdAt: "desc" }, { id: "asc" }],
      skip: (filter.page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.story.count({ where }),
  ]);
  return { stories: rows.map(toListItem), total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

/** Published story count per province slug (optionally within one category). */
export async function countByProvince(categorySlug?: string) {
  // One round trip: the province list is small, so fetch it alongside the counts.
  const [groups, provinces] = await Promise.all([
    prisma.story.groupBy({
      by: ["provinceId"],
      where: {
        status: StoryStatus.APPROVED,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      _count: { _all: true },
    }),
    prisma.province.findMany({ select: { id: true, slug: true } }),
  ]);
  const slugOf = new Map(provinces.map((province) => [province.id, province.slug]));
  return new Map(
    groups.flatMap((group) => {
      const slug = slugOf.get(group.provinceId);
      return slug ? [[slug, group._count._all] as const] : [];
    })
  );
}

/** Published story count per category slug (optionally within one province). */
export async function countByCategory(provinceSlug?: string) {
  // One round trip: the category list is small, so fetch it alongside the counts.
  const [groups, categories] = await Promise.all([
    prisma.story.groupBy({
      by: ["categoryId"],
      where: {
        status: StoryStatus.APPROVED,
        ...(provinceSlug ? { province: { slug: provinceSlug } } : {}),
      },
      _count: { _all: true },
    }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
  ]);
  const slugOf = new Map(categories.map((category) => [category.id, category.slug]));
  return new Map(
    groups.flatMap((group) => {
      const slug = slugOf.get(group.categoryId);
      return slug ? [[slug, group._count._all] as const] : [];
    })
  );
}

/** Pins for a province's small map. */
export async function listProvincePoints(provinceSlug: string) {
  return prisma.story.findMany({
    where: { status: StoryStatus.APPROVED, province: { slug: provinceSlug } },
    select: {
      id: true,
      title: true,
      slug: true,
      latitude: true,
      longitude: true,
      category: { select: { slug: true } },
    },
    take: 500,
  });
}

/** URL parts of every published story, for prebuilding story pages. */
export function listStoryPaths() {
  return prisma.story.findMany({
    where: { status: StoryStatus.APPROVED },
    select: { slug: true, province: { select: { slug: true } } },
  });
}

/** Everything sitemap.xml needs, nothing more. */
export async function listSitemapStories(skip = 0, take = 45_000) {
  return prisma.story.findMany({
    where: { status: StoryStatus.APPROVED },
    select: {
      slug: true,
      updatedAt: true,
      province: { select: { slug: true } },
      images: {
        take: 1,
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: { url: true },
      },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    skip,
    take,
  });
}

export function countPublishedStories(filter: { categorySlug?: string; provinceSlug?: string } = {}) {
  return prisma.story.count({
    where: {
      status: StoryStatus.APPROVED,
      ...(filter.categorySlug ? { category: { slug: filter.categorySlug } } : {}),
      ...(filter.provinceSlug ? { province: { slug: filter.provinceSlug } } : {}),
    },
  });
}

/** Latest update per province with at least one published story. */
export async function provinceLastModified() {
  const groups = await prisma.story.groupBy({
    by: ["provinceId"],
    where: { status: StoryStatus.APPROVED },
    _max: { updatedAt: true },
  });
  if (!groups.length) return [];
  const provinces = await prisma.province.findMany({
    where: { id: { in: groups.map((group) => group.provinceId) } },
    select: { id: true, slug: true },
  });
  const slugOf = new Map(provinces.map((province) => [province.id, province.slug]));
  return groups.flatMap((group) => {
    const slug = slugOf.get(group.provinceId);
    return slug ? [{ slug, updatedAt: group._max.updatedAt }] : [];
  });
}

/** Story slug/province/category, for cache revalidation after a status change. */
export function storyRouteInfo(where: Prisma.StoryWhereInput) {
  return prisma.story.findMany({
    where,
    select: { slug: true, province: { select: { slug: true } }, category: { select: { slug: true } } },
  });
}
