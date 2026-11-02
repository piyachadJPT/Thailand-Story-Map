import { storySearchConditions } from "./search";
import { StoryStatus } from "@prisma/client";
import { prisma } from "@/api/db/prisma";
import { ApiError, ForbiddenError, NotFoundError } from "@/api/common/errors";
import type { UpdateStoryInput } from "@/models/schemas/story";
import { validateOwnedCover } from "@/api/upload/service";
import type { CreateStoryInput, ListStoriesQuery } from "@/models/schemas";
import type {
  StoryDetail,
  StoryListItem,
  StoryMapPoint,
} from "@/models/types/story";

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
  author: { select: { name: true } },
  category: { select: { slug: true, color: true } },
  province: { select: { slug: true } },
} as const;

export async function listStories(query: ListStoriesQuery) {
  const page = query.page;
  const limit = query.limit;
  const status = query.status ?? StoryStatus.APPROVED;

  const where = {
    status,
    ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
    ...(query.provinceSlug ? { province: { slug: query.provinceSlug } } : {}),
    ...(query.tagSlug
      ? { tags: { some: { tag: { slug: query.tagSlug } } } }
      : {}),
    AND: storySearchConditions(query.q),
  };

  const [rows, total] = await Promise.all([
    prisma.story.findMany({
      where,
      select: storyListSelect,
      orderBy:
        query.sort === "recent"
          ? [{ createdAt: "desc" }, { id: "asc" }]
          : [{ viewCount: "desc" }, { createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.story.count({ where }),
  ]);

  const data: StoryListItem[] = rows.map((row) => ({
    ...toMapPoint(row),
    status: row.status,
    authorName: row.author.name,
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

export async function listMapPoints(
  query: Pick<ListStoriesQuery, "categorySlug" | "provinceSlug" | "tagSlug">
) {
  const rows = await prisma.story.findMany({
    where: {
      status: StoryStatus.APPROVED,
      ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
      ...(query.provinceSlug ? { province: { slug: query.provinceSlug } } : {}),
      ...(query.tagSlug
        ? { tags: { some: { tag: { slug: query.tagSlug } } } }
        : {}),
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
  storySlug: string
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
      images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      tags: { include: { tag: true } },
    },
  });

  if (!story) {
    throw new NotFoundError("Story not found");
  }

  const viewedStory = await prisma.story.update({
    where: { id: story.id },
    data: { viewCount: { increment: 1 } },
    select: { viewCount: true },
  });

  return {
    ...toMapPoint(story),
    viewCount: viewedStory.viewCount,
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
  const { tagIds, images, coverUrl, ...rest } = input;
  const { status: ignoredStatus, ...storyData } = rest;
  void ignoredStatus;
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { slug: true },
  });
  if (!category) throw new NotFoundError("Story category not found");
  const isCrime = category.slug === "crime";
  if (isCrime && !input.sourceUrl) {
    throw new ApiError("คดีอาชญากรรมต้องมีลิงก์หลักฐานอ้างอิง");
  }
  if (coverUrl) await validateOwnedCover(coverUrl, authorId);
  const storyImages = coverUrl
    ? [
        { url: coverUrl, altText: input.title, sortOrder: 0 },
        ...images.map((image, index) => ({ ...image, sortOrder: index + 1 })),
      ]
    : images;

  const story = await prisma.story.create({
    data: {
      ...storyData,
      authorId,
      status: isCrime ? StoryStatus.PENDING : StoryStatus.APPROVED,
      tags: tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
      images: storyImages.length ? { create: storyImages } : undefined,
    },
    select: storyListSelect,
  });
  return {
    id: story.id,
    slug: story.slug,
    status: story.status,
    mapPoint: story.status === StoryStatus.APPROVED ? toMapPoint(story) : null,
  };
}

export async function getOwnedStory(id: string, authorId: string) {
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      category: { select: { slug: true } },
      province: { select: { slug: true } },
    },
  });
  if (!story) throw new NotFoundError("ไม่พบเรื่องราว");
  if (story.authorId !== authorId)
    throw new ForbiddenError("คุณแก้ไขได้เฉพาะเรื่องราวของตัวเอง");
  return story;
}

export async function updateStory(
  id: string,
  input: UpdateStoryInput,
  authorId: string
) {
  const story = await getOwnedStory(id, authorId);
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });
  if (!category) throw new NotFoundError("ไม่พบประเภทเรื่องราว");
  const province = await prisma.province.findUnique({
    where: { id: input.provinceId },
  });
  if (!province) throw new NotFoundError("ไม่พบจังหวัด");
  const isCrime = category.slug === "crime";
  if (isCrime && !input.sourceUrl)
    throw new ApiError("คดีอาชญากรรมต้องมีลิงก์หลักฐานอ้างอิง");
  const needsReview =
    isCrime ||
    story.category.slug === "crime" ||
    story.status !== StoryStatus.APPROVED;
  const { coverUrl, ...storyData } = input;
  const currentCover = story.images[0];
  const coverChanged =
    coverUrl !== undefined && coverUrl !== (currentCover?.url ?? null);
  if (coverChanged && coverUrl) await validateOwnedCover(coverUrl, authorId);
  const updated = await prisma.story.update({
    where: { id, authorId },
    data: {
      ...storyData,
      ...(coverChanged
        ? {
            images: coverUrl
              ? currentCover
                ? {
                    update: {
                      where: { id: currentCover.id },
                      data: { url: coverUrl, altText: input.title },
                    },
                  }
                : {
                    create: {
                      url: coverUrl,
                      altText: input.title,
                      sortOrder: 0,
                    },
                  }
              : currentCover
                ? { delete: { id: currentCover.id } }
                : undefined,
          }
        : {}),
      isSensitive: isCrime || input.isSensitive,
      status: needsReview ? StoryStatus.PENDING : StoryStatus.APPROVED,
      rejectReason: null,
    },
    select: { id: true, slug: true, status: true },
  });
  return { ...updated, provinceSlug: province.slug };
}
