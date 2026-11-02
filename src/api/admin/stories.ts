import { Prisma, ReportStatus, StoryStatus } from "@prisma/client";
import { prisma } from "@/api/db/prisma";
import { ConflictError, NotFoundError } from "@/api/common/errors";
import { AUDIT_ACTION, AUDIT_TARGET, STORY_TAKEDOWN_ACTIONS } from "@/config/auditActions";
import type { AdminStoriesQuery, ModerateStoryInput, StoryModerationAction } from "@/models/schemas/admin";
import { auditLogsFor, pageMeta } from "./audit";

export const STALE_STATUS_MESSAGE = "สถานะเรื่องเปลี่ยนไปแล้ว กรุณารีเฟรช";

export const STORY_TRANSITIONS: Record<
  StoryModerationAction,
  { from: StoryStatus; to: StoryStatus; audit: string }
> = {
  APPROVE: { from: StoryStatus.PENDING, to: StoryStatus.APPROVED, audit: AUDIT_ACTION.STORY_APPROVE },
  REJECT: { from: StoryStatus.PENDING, to: StoryStatus.REJECTED, audit: AUDIT_ACTION.STORY_REJECT },
  HIDE: { from: StoryStatus.APPROVED, to: StoryStatus.REJECTED, audit: AUDIT_ACTION.STORY_HIDE },
  RESTORE: { from: StoryStatus.REJECTED, to: StoryStatus.APPROVED, audit: AUDIT_ACTION.STORY_RESTORE },
};

/**
 * Applies one transition atomically: the update only matches while the story
 * is still in the expected status, so two admins cannot both apply it.
 * Returns false when the status no longer matches.
 */
export async function applyStoryTransition(
  tx: Prisma.TransactionClient,
  storyId: string,
  action: StoryModerationAction,
  adminId: string,
  reason?: string
) {
  const transition = STORY_TRANSITIONS[action];
  const { count } = await tx.story.updateMany({
    where: { id: storyId, status: transition.from },
    data: {
      status: transition.to,
      rejectReason: transition.to === StoryStatus.REJECTED ? (reason ?? null) : null,
    },
  });
  if (count === 0) return false;
  await tx.auditLog.create({
    data: {
      adminId,
      action: transition.audit,
      targetType: AUDIT_TARGET.STORY,
      targetId: storyId,
      note: reason ?? null,
    },
  });
  return true;
}

export async function moderateStory(storyId: string, input: ModerateStoryInput, adminId: string) {
  const reason = "reason" in input ? input.reason : undefined;
  return prisma.$transaction(async (tx) => {
    const applied = await applyStoryTransition(tx, storyId, input.action, adminId, reason);
    if (!applied) {
      const exists = await tx.story.findUnique({ where: { id: storyId }, select: { id: true } });
      if (!exists) throw new NotFoundError("ไม่พบเรื่องนี้");
      throw new ConflictError(STALE_STATUS_MESSAGE);
    }
    return { id: storyId, status: STORY_TRANSITIONS[input.action].to };
  });
}

export const adminStoryRowSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  status: true,
  isSensitive: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, slug: true, name: true } },
  province: { select: { id: true, slug: true, name: true } },
  author: { select: { id: true, name: true, email: true, image: true } },
  images: {
    select: { url: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    take: 1,
  },
  _count: { select: { reports: { where: { status: ReportStatus.OPEN } } } },
} satisfies Prisma.StorySelect;

type StoryRow = Prisma.StoryGetPayload<{ select: typeof adminStoryRowSelect }>;

async function toStoryRows(rows: StoryRow[]) {
  const resubmitted = rows.length
    ? await prisma.auditLog.findMany({
        where: { targetId: { in: rows.map((row) => row.id) }, action: { in: STORY_TAKEDOWN_ACTIONS } },
        select: { targetId: true },
        distinct: ["targetId"],
      })
    : [];
  const takenDown = new Set(resubmitted.map((log) => log.targetId));
  return rows.map(({ images, _count, ...row }) => ({
    ...row,
    coverUrl: images[0]?.url ?? null,
    openReports: _count.reports,
    /** Pending again after an earlier rejection or takedown. */
    resubmitted: row.status === StoryStatus.PENDING && takenDown.has(row.id),
  }));
}

export async function listAdminStories(
  query: Omit<AdminStoriesQuery, "status"> & { status?: AdminStoriesQuery["status"]; authorId?: string }
) {
  const q = query.q || null;
  const base: Prisma.StoryWhereInput = {
    ...(query.authorId ? { authorId: query.authorId } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.provinceId ? { provinceId: query.provinceId } : {}),
    ...(query.hasReports ? { reports: { some: { status: ReportStatus.OPEN } } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { author: { name: { contains: q, mode: "insensitive" } } },
            { author: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const statusWhere: Prisma.StoryWhereInput =
    query.status === "REJECTED"
      ? { status: { in: [StoryStatus.REJECTED, StoryStatus.DRAFT] } }
      : query.status
        ? { status: query.status }
        : {};
  const where = { ...base, ...statusWhere };
  const sort = query.sort ?? (query.status === "PENDING" ? "oldest" : "newest");
  const orderBy: Prisma.StoryOrderByWithRelationInput[] =
    sort === "reports"
      ? [{ reports: { _count: "desc" } }, { updatedAt: "desc" }, { id: "asc" }]
      : [{ updatedAt: sort === "oldest" ? "asc" : "desc" }, { id: "asc" }];

  const [rows, total, groups] = await Promise.all([
    prisma.story.findMany({
      where,
      select: adminStoryRowSelect,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.story.count({ where }),
    prisma.story.groupBy({ by: ["status"], where: base, _count: { _all: true } }),
  ]);
  const countOf = (status: StoryStatus) =>
    groups.find((group) => group.status === status)?._count._all ?? 0;

  return {
    data: await toStoryRows(rows),
    meta: pageMeta(query.page, query.pageSize, total),
    counts: {
      PENDING: countOf(StoryStatus.PENDING),
      APPROVED: countOf(StoryStatus.APPROVED),
      REJECTED: countOf(StoryStatus.REJECTED) + countOf(StoryStatus.DRAFT),
    },
  };
}

/** Pending queue order: oldest submission first. */
const queueOrder = [{ updatedAt: "asc" as const }, { id: "asc" as const }];

async function queuePosition(story: { id: string; updatedAt: Date }) {
  const before: Prisma.StoryWhereInput = {
    status: StoryStatus.PENDING,
    OR: [{ updatedAt: { lt: story.updatedAt } }, { updatedAt: story.updatedAt, id: { lt: story.id } }],
  };
  const after: Prisma.StoryWhereInput = {
    status: StoryStatus.PENDING,
    OR: [{ updatedAt: { gt: story.updatedAt } }, { updatedAt: story.updatedAt, id: { gt: story.id } }],
  };
  const [total, index, next, previous] = await Promise.all([
    prisma.story.count({ where: { status: StoryStatus.PENDING } }),
    prisma.story.count({ where: before }),
    prisma.story.findFirst({ where: after, orderBy: queueOrder, select: { id: true } }),
    prisma.story.findFirst({
      where: before,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      select: { id: true },
    }),
  ]);
  return { position: index + 1, total, nextId: next?.id ?? null, previousId: previous?.id ?? null };
}

export async function getAdminStory(id: string) {
  const story = await prisma.story.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      content: true,
      status: true,
      rejectReason: true,
      sourceUrl: true,
      isSensitive: true,
      viewCount: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { id: true, slug: true, name: true } },
      province: { select: { id: true, slug: true, name: true } },
      images: {
        select: { id: true, url: true, altText: true, sortOrder: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      },
      tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          status: true,
          createdAt: true,
          _count: { select: { stories: true } },
        },
      },
      reports: {
        select: {
          id: true,
          reasonType: true,
          reason: true,
          status: true,
          resolution: true,
          createdAt: true,
          reporter: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
  if (!story) throw new NotFoundError("ไม่พบเรื่องนี้");
  const [history, queue] = await Promise.all([
    auditLogsFor({ targetId: id }),
    story.status === StoryStatus.PENDING ? queuePosition(story) : null,
  ]);
  return {
    ...story,
    tags: story.tags.map((item) => item.tag),
    history,
    queue,
  };
}
