import { StoryStatus } from "@prisma/client";
import { prisma } from "@/api/db/prisma";
import { NotFoundError } from "@/api/common/errors";
import type { CreateStoryInput, ListStoriesQuery } from "@/models/schemas";
import type { StoryDetail, StoryListItem, StoryMapPoint } from "@/models/types/story";

function toMapPoint(row: {
  id: string;
  title: string;
  slug: string;
  summary: string;
  latitude: number;
  longitude: number;
  viewCount: number;
  category: { slug: string; color: string | null };
  province: { slug: string };
}): StoryMapPoint {
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
  };
}

const storyListSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  latitude: true,
  longitude: true,
  viewCount: true,
  status: true,
  createdAt: true,
  category: { select: { slug: true, color: true } },
  province: { select: { slug: true } },
} as const;

export async function listStories(query: ListStoriesQuery) {
  const page = query.page;
  const limit = query.limit;
  const status = query.status ?? StoryStatus.APPROVED;

  const where = {
    status,
    ...(query.categorySlug
      ? { category: { slug: query.categorySlug } }
      : {}),
    ...(query.provinceSlug
      ? { province: { slug: query.provinceSlug } }
      : {}),
    ...(query.tagSlug ? { tags: { some: { tag: { slug: query.tagSlug } } } } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" as const } },
            { summary: { contains: query.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.story.findMany({
      where,
      select: storyListSelect,
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.story.count({ where }),
  ]);

  const data: StoryListItem[] = rows.map((row) => ({
    ...toMapPoint(row),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function listMapPoints(query: Pick<ListStoriesQuery, "categorySlug" | "provinceSlug" | "tagSlug">) {
  const rows = await prisma.story.findMany({
    where: {
      status: StoryStatus.APPROVED,
      ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
      ...(query.provinceSlug ? { province: { slug: query.provinceSlug } } : {}),
      ...(query.tagSlug ? { tags: { some: { tag: { slug: query.tagSlug } } } } : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      latitude: true,
      longitude: true,
      viewCount: true,
      category: { select: { slug: true, color: true } },
      province: { select: { slug: true } },
    },
  });

  return rows.map(toMapPoint);
}

export async function getStoryByProvinceAndSlug(
  provinceSlug: string,
  storySlug: string,
): Promise<StoryDetail> {
  const story = await prisma.story.findFirst({
    where: {
      slug: storySlug,
      province: { slug: provinceSlug },
      status: StoryStatus.APPROVED,
    },
    include: {
      category: { select: { slug: true, color: true } },
      province: { select: { slug: true } },
      author: { select: { id: true, name: true, image: true } },
      images: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
    },
  });

  if (!story) {
    throw new NotFoundError("Story not found");
  }

  await prisma.story.update({
    where: { id: story.id },
    data: { viewCount: { increment: 1 } },
  });

  return {
    ...toMapPoint(story),
    status: story.status,
    createdAt: story.createdAt.toISOString(),
    content: story.content,
    sourceUrl: story.sourceUrl,
    isSensitive: story.isSensitive,
    rejectReason: story.rejectReason,
    images: story.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      sortOrder: img.sortOrder,
    })),
    tags: story.tags.map((st) => ({
      id: st.tag.id,
      name: st.tag.name,
      slug: st.tag.slug,
    })),
    author: {
      id: story.author.id,
      name: story.author.name,
      image: story.author.image,
    },
  };
}

/** Requires authenticated author — wired in Phase 1 with Auth.js */
export async function createStory(input: CreateStoryInput, authorId: string) {
  const { tagIds, images, status, ...rest } = input;

  return prisma.story.create({
    data: {
      ...rest,
      authorId,
      status,
      tags: tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
      images: images.length ? { create: images } : undefined,
    },
    select: { id: true, slug: true, status: true },
  });
}
