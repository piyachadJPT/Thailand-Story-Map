import { Prisma, ReportStatus, StoryStatus } from "@prisma/client";
import { prisma } from "@/api/db/prisma";
import { ConflictError, NotFoundError } from "@/api/common/errors";
import { AUDIT_ACTION, AUDIT_TARGET } from "@/config/auditActions";
import type { AdminReportsQuery, ResolveReportsInput } from "@/models/schemas/admin";
import { pageMeta } from "./audit";
import { applyStoryTransition } from "./stories";

export const REPORT_RESOLUTION = { DISMISSED: "DISMISSED", STORY_HIDDEN: "STORY_HIDDEN" } as const;

/** Reports grouped by story, the most-reported stories first. */
export async function listReportGroups(query: AdminReportsQuery) {
  const where: Prisma.ReportWhereInput = {
    status: query.status,
    ...(query.reasonType ? { reasonType: query.reasonType } : {}),
  };
  const [groups, allGroups, openStories, resolvedStories] = await Promise.all([
    prisma.report.groupBy({
      by: ["storyId"],
      where,
      _count: { _all: true },
      _max: { createdAt: true },
      orderBy: [{ _count: { storyId: "desc" } }, { _max: { createdAt: "desc" } }, { storyId: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.report.groupBy({ by: ["storyId"], where }),
    prisma.report.groupBy({ by: ["storyId"], where: { status: ReportStatus.OPEN } }),
    prisma.report.groupBy({ by: ["storyId"], where: { status: ReportStatus.RESOLVED } }),
  ]);
  const storyIds = groups.map((group) => group.storyId);
  const [stories, reports] = storyIds.length
    ? await Promise.all([
        prisma.story.findMany({
          where: { id: { in: storyIds } },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            province: { select: { slug: true, name: true } },
            category: { select: { slug: true } },
            author: { select: { id: true, name: true } },
          },
        }),
        prisma.report.findMany({
          where: { ...where, storyId: { in: storyIds } },
          select: {
            id: true,
            storyId: true,
            reasonType: true,
            reason: true,
            status: true,
            resolution: true,
            resolvedNote: true,
            resolvedAt: true,
            createdAt: true,
            reporter: { select: { id: true, name: true } },
            resolvedBy: { select: { id: true, name: true, username: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];

  const data = groups.flatMap((group) => {
    const story = stories.find((item) => item.id === group.storyId);
    if (!story) return [];
    const items = reports.filter((report) => report.storyId === group.storyId);
    const byType: Record<string, number> = {};
    for (const report of items) byType[report.reasonType] = (byType[report.reasonType] ?? 0) + 1;
    return [{ story, count: group._count._all, byType, reports: items }];
  });

  return {
    data,
    meta: pageMeta(query.page, query.pageSize, allGroups.length),
    counts: { OPEN: openStories.length, RESOLVED: resolvedStories.length },
  };
}

/** Closes every open report of a story, optionally hiding the story too. */
export async function resolveStoryReports(storyId: string, input: ResolveReportsInput, adminId: string) {
  const story = await prisma.story.findUnique({ where: { id: storyId }, select: { id: true } });
  if (!story) throw new NotFoundError("ไม่พบเรื่องนี้");
  const note = input.note?.trim() || null;

  return prisma.$transaction(async (tx) => {
    let storyHidden = false;
    if (input.action === "HIDE_STORY") {
      storyHidden = await applyStoryTransition(tx, storyId, "HIDE", adminId, note ?? undefined);
    }
    const { count } = await tx.report.updateMany({
      where: { storyId, status: ReportStatus.OPEN },
      data: {
        status: ReportStatus.RESOLVED,
        resolution:
          input.action === "DISMISS" ? REPORT_RESOLUTION.DISMISSED : REPORT_RESOLUTION.STORY_HIDDEN,
        resolvedNote: note,
        resolvedAt: new Date(),
        resolvedById: adminId,
      },
    });
    if (count === 0 && !storyHidden) throw new ConflictError("ไม่มีรายงานที่เปิดอยู่แล้ว กรุณารีเฟรช");
    // targetType REPORT with the story id: the report group is identified by its story.
    await tx.auditLog.create({
      data: {
        adminId,
        action: input.action === "DISMISS" ? AUDIT_ACTION.REPORT_DISMISS : AUDIT_ACTION.REPORT_HIDE_STORY,
        targetType: AUDIT_TARGET.REPORT,
        targetId: storyId,
        note: [`ปิด ${count} รายงาน`, note].filter(Boolean).join(" — "),
      },
    });
    const current = await tx.story.findUnique({ where: { id: storyId }, select: { status: true } });
    return { resolved: count, storyHidden, storyStatus: current?.status ?? StoryStatus.REJECTED };
  });
}
