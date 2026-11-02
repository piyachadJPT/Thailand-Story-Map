import { ReportStatus, StoryStatus, UserRole } from "@prisma/client";
import { prisma } from "@/api/db/prisma";
import { provinceRecords } from "@/lib/thai-provinces";
import { AUDIT_TARGET } from "@/config/auditActions";
import { describeAuditLogs } from "./audit";
import { DAY_MS, bangkokDayKey, fillDailySeries, percentChange, rangeBounds } from "./time";

type StoryDay = { day: string; published: number; other: number };
type CountDay = { day: string; count: number };

const HOUR_MS = 60 * 60 * 1000;

function sumBetween<T extends { day: string }>(rows: T[], from: string, field: keyof T, to?: string) {
  return rows
    .filter((row) => row.day >= from && (to === undefined || row.day < to))
    .reduce((sum, row) => sum + Number(row[field] ?? 0), 0);
}

export async function getOverview(range: number, now = new Date()) {
  const { start, previousStart } = rangeBounds(range, now);
  const startKey = bangkokDayKey(start);
  const previousKey = bangkokDayKey(previousStart);

  // created_at is a UTC timestamp without time zone: convert UTC → Bangkok before truncating.
  const [storyDays, userDays, reportDays] = await Promise.all([
    prisma.$queryRaw<StoryDay[]>`
      SELECT to_char(date_trunc('day', (created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok'), 'YYYY-MM-DD') AS day,
        COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS published,
        COUNT(*) FILTER (WHERE status <> 'APPROVED')::int AS other
      FROM stories WHERE created_at >= ${previousStart}
      GROUP BY 1`,
    prisma.$queryRaw<CountDay[]>`
      SELECT to_char(date_trunc('day', (created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok'), 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS count
      FROM users WHERE created_at >= ${previousStart} AND role = 'USER'
      GROUP BY 1`,
    prisma.$queryRaw<CountDay[]>`
      SELECT to_char(date_trunc('day', (created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok'), 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS count
      FROM reports WHERE created_at >= ${previousStart}
      GROUP BY 1`,
  ]);

  const [
    views,
    pendingCount,
    oldestPending,
    openReports,
    categories,
    categoryGroups,
    provinceGroups,
    stalePending,
    reportedGroups,
    topStories,
  ] = await Promise.all([
    prisma.story.aggregate({ where: { status: StoryStatus.APPROVED }, _sum: { viewCount: true } }),
    prisma.story.count({ where: { status: StoryStatus.PENDING } }),
    prisma.story.findFirst({
      where: { status: StoryStatus.PENDING },
      orderBy: { updatedAt: "asc" },
      select: { updatedAt: true },
    }),
    prisma.report.count({ where: { status: ReportStatus.OPEN } }),
    prisma.category.findMany({ select: { id: true, slug: true, name: true } }),
    prisma.story.groupBy({
      by: ["categoryId"],
      where: { status: StoryStatus.APPROVED },
      _count: { _all: true },
    }),
    prisma.story.groupBy({
      by: ["provinceId"],
      where: { status: StoryStatus.APPROVED },
      _count: { _all: true },
    }),
    prisma.story.findMany({
      where: { status: StoryStatus.PENDING, updatedAt: { lt: new Date(now.getTime() - DAY_MS) } },
      orderBy: { updatedAt: "asc" },
      take: 5,
      select: { id: true, title: true, updatedAt: true, author: { select: { name: true } } },
    }),
    prisma.report.groupBy({
      by: ["storyId"],
      where: { status: ReportStatus.OPEN },
      _count: { _all: true },
      having: { storyId: { _count: { gte: 3 } } },
      orderBy: { _count: { storyId: "desc" } },
      take: 5,
    }),
    prisma.story.findMany({
      where: { status: StoryStatus.APPROVED },
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        viewCount: true,
        category: { select: { slug: true } },
        province: { select: { name: true } },
        images: { select: { url: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 1 },
      },
    }),
  ]);

  const reportedStories = reportedGroups.length
    ? await prisma.story.findMany({
        where: { id: { in: reportedGroups.map((group) => group.storyId) } },
        select: { id: true, title: true, status: true },
      })
    : [];

  const storySeries = fillDailySeries(storyDays, start, range, ["published", "other"] as const);
  const userSeries = fillDailySeries(userDays, start, range, ["count"] as const);
  const reportSeries = fillDailySeries(reportDays, start, range, ["count"] as const);

  const publishedNow = sumBetween(storyDays, startKey, "published");
  const publishedBefore = sumBetween(storyDays, previousKey, "published", startKey);
  const usersNow = sumBetween(userDays, startKey, "count");
  const usersBefore = sumBetween(userDays, previousKey, "count", startKey);

  const provinceCounts = await prisma.province.findMany({
    where: { id: { in: provinceGroups.map((group) => group.provinceId) } },
    select: { id: true, name: true, slug: true },
  });
  const topProvinces = provinceGroups
    .map((group) => ({
      ...(provinceCounts.find((province) => province.id === group.provinceId) ?? {
        id: group.provinceId,
        name: "ไม่ทราบ",
        slug: "",
      }),
      count: group._count._all,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "th"))
    .slice(0, 10);

  return {
    range,
    generatedAt: now,
    kpis: {
      published: {
        value: publishedNow,
        change: percentChange(publishedNow, publishedBefore),
        spark: storySeries.map((point) => point.published),
      },
      newAuthors: {
        value: usersNow,
        change: percentChange(usersNow, usersBefore),
        spark: userSeries.map((point) => point.count),
      },
      totalViews: { value: views._sum.viewCount ?? 0 },
      pending: {
        value: pendingCount,
        oldestHours: oldestPending
          ? Math.floor((now.getTime() - oldestPending.updatedAt.getTime()) / HOUR_MS)
          : null,
      },
      openReports: { value: openReports, spark: reportSeries.map((point) => point.count) },
    },
    series: storySeries,
    categories: categories
      .map((category) => ({
        slug: category.slug,
        name: category.name,
        count: categoryGroups.find((group) => group.categoryId === category.id)?._count._all ?? 0,
      }))
      .sort((a, b) => b.count - a.count),
    provinces: {
      top: topProvinces,
      withoutStories: Math.max(0, provinceRecords.length - provinceGroups.length),
      total: provinceRecords.length,
    },
    needsAttention: {
      stalePending: stalePending.map((story) => ({
        id: story.id,
        title: story.title,
        authorName: story.author.name,
        waitingHours: Math.floor((now.getTime() - story.updatedAt.getTime()) / HOUR_MS),
      })),
      heavilyReported: reportedGroups.flatMap((group) => {
        const story = reportedStories.find((item) => item.id === group.storyId);
        return story ? [{ ...story, openReports: group._count._all }] : [];
      }),
    },
    topStories: topStories.map(({ images, category, province, ...story }) => ({
      ...story,
      categorySlug: category.slug,
      provinceName: province.name,
      coverUrl: images[0]?.url ?? null,
    })),
    activity: await recentActivity(),
  };
}

type Activity = {
  id: string;
  kind: "story" | "report" | "user" | "audit";
  at: Date;
  title: string;
  detail: string | null;
  href: { type: "story" | "user" | "audit"; id: string } | null;
  action?: string;
};

async function recentActivity(limit = 10): Promise<Activity[]> {
  const [stories, reports, users, logs] = await Promise.all([
    prisma.story.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, title: true, createdAt: true, author: { select: { name: true } } },
    }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, reasonType: true, createdAt: true, story: { select: { id: true, title: true } } },
    }),
    prisma.user.findMany({
      where: { role: UserRole.USER },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.auditLog.findMany({
      // Logins and password changes are noise on the dashboard; they stay in the audit page.
      where: { targetType: { not: AUDIT_TARGET.ADMIN } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        note: true,
        createdAt: true,
        admin: { select: { id: true, name: true, username: true, image: true } },
      },
    }),
  ]);
  const described = await describeAuditLogs(logs);
  const items: Activity[] = [
    ...stories.map((story) => ({
      id: `story-${story.id}`,
      kind: "story" as const,
      at: story.createdAt,
      title: story.title,
      detail: story.author.name,
      href: { type: "story" as const, id: story.id },
    })),
    ...reports.map((report) => ({
      id: `report-${report.id}`,
      kind: "report" as const,
      at: report.createdAt,
      title: report.story.title,
      detail: report.reasonType,
      href: { type: "story" as const, id: report.story.id },
    })),
    ...users.map((user) => ({
      id: `user-${user.id}`,
      kind: "user" as const,
      at: user.createdAt,
      title: user.name,
      detail: null,
      href: { type: "user" as const, id: user.id },
    })),
    ...described.map((log) => ({
      id: `audit-${log.id}`,
      kind: "audit" as const,
      at: log.createdAt,
      title: log.targetLabel ?? "",
      detail: log.admin.username ?? log.admin.name,
      action: log.action,
      href:
        log.targetType === AUDIT_TARGET.USER
          ? { type: "user" as const, id: log.targetId }
          : log.targetType === AUDIT_TARGET.ADMIN
            ? { type: "audit" as const, id: log.targetId }
            : { type: "story" as const, id: log.targetId },
    })),
  ];
  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

export async function getOverviewMap() {
  const rows = await prisma.story.findMany({
    where: { status: StoryStatus.APPROVED },
    select: {
      id: true,
      title: true,
      latitude: true,
      longitude: true,
      category: { select: { slug: true } },
    },
  });
  return rows.map(({ category, ...row }) => ({ ...row, categorySlug: category.slug }));
}

export async function getSidebarCounts() {
  const [pending, openReports] = await Promise.all([
    prisma.story.count({ where: { status: StoryStatus.PENDING } }),
    prisma.report.count({ where: { status: ReportStatus.OPEN } }),
  ]);
  return { pending, openReports };
}

export async function adminSearch(q: string) {
  const [stories, users] = await Promise.all([
    prisma.story.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, category: { select: { slug: true } } },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, image: true, status: true, role: true },
    }),
  ]);
  return { stories, users };
}
