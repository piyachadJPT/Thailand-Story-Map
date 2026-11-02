import { Prisma, ReportStatus, StoryStatus, UserRole, UserStatus } from "@prisma/client";
import { prisma } from "@/api/db/prisma";
import { ConflictError, ForbiddenError, NotFoundError } from "@/api/common/errors";
import { AUDIT_ACTION, AUDIT_TARGET } from "@/config/auditActions";
import type { AdminUsersQuery, ModerateUserInput } from "@/models/schemas/admin";
import { auditLogsFor, pageMeta } from "./audit";
import { DAY_MS } from "./time";

type UserListRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  username: string | null;
  isAdminAccount: boolean;
  createdAt: Date;
  totalStories: number;
  publishedStories: number;
  totalViews: number;
  openReports: number;
  total: number;
};

function likePattern(value: string) {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

/** One aggregate query: users with story, view and open-report counts. */
export async function listAdminUsers(query: AdminUsersQuery) {
  const filters: Prisma.Sql[] = [];
  if (query.tab === "active") filters.push(Prisma.sql`u.status = 'ACTIVE' AND u.role = 'USER'`);
  if (query.tab === "banned") filters.push(Prisma.sql`u.status = 'BANNED'`);
  if (query.tab === "admin") filters.push(Prisma.sql`u.role = 'ADMIN'`);
  if (query.q) {
    const pattern = likePattern(query.q);
    filters.push(Prisma.sql`(u.name ILIKE ${pattern} OR u.email ILIKE ${pattern})`);
  }
  if (query.hasReports) filters.push(Prisma.sql`COALESCE(rep.open_reports, 0) > 0`);
  if (query.noStories) filters.push(Prisma.sql`COALESCE(st.total_stories, 0) = 0`);
  const where = filters.length ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}` : Prisma.empty;
  const orderBy = {
    recent: Prisma.sql`u.created_at DESC, u.id ASC`,
    stories: Prisma.sql`COALESCE(st.total_stories, 0) DESC, u.created_at DESC, u.id ASC`,
    reports: Prisma.sql`COALESCE(rep.open_reports, 0) DESC, u.created_at DESC, u.id ASC`,
    name: Prisma.sql`u.name ASC, u.id ASC`,
  }[query.sort];

  const rows = await prisma.$queryRaw<UserListRow[]>`
    WITH st AS (
      SELECT s.author_id AS id,
        COUNT(*)::int AS total_stories,
        COUNT(*) FILTER (WHERE s.status = 'APPROVED')::int AS published_stories,
        COALESCE(SUM(s.view_count), 0)::bigint AS total_views
      FROM stories s
      GROUP BY s.author_id
    ), rep AS (
      SELECT s.author_id AS id, COUNT(*)::int AS open_reports
      FROM reports r JOIN stories s ON s.id = r.story_id
      WHERE r.status = 'OPEN'
      GROUP BY s.author_id
    )
    SELECT u.id, u.name, u.email, u.image, u.role, u.status, u.username,
      (u.password_hash IS NOT NULL) AS "isAdminAccount",
      u.created_at AS "createdAt",
      COALESCE(st.total_stories, 0) AS "totalStories",
      COALESCE(st.published_stories, 0) AS "publishedStories",
      COALESCE(st.total_views, 0) AS "totalViews",
      COALESCE(rep.open_reports, 0) AS "openReports",
      COUNT(*) OVER()::int AS total
    FROM users u
    LEFT JOIN st ON st.id = u.id
    LEFT JOIN rep ON rep.id = u.id
    ${where}
    ORDER BY ${orderBy}
    LIMIT ${query.pageSize} OFFSET ${(query.page - 1) * query.pageSize}
  `;

  const since = new Date(Date.now() - 30 * DAY_MS);
  const [all, newUsers, banned, active, admins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since }, role: UserRole.USER } }),
    prisma.user.count({ where: { status: UserStatus.BANNED } }),
    prisma.user.count({ where: { status: UserStatus.ACTIVE, role: UserRole.USER } }),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
  ]);
  const total = rows[0]?.total ?? 0;
  return {
    data: rows.map(({ total: _total, ...row }) => {
      void _total;
      return { ...row, totalViews: Number(row.totalViews) };
    }),
    meta: pageMeta(query.page, query.pageSize, total),
    summary: { all, newUsers, banned },
    counts: { all, active, banned, admin: admins },
  };
}

export async function getAdminUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      username: true,
      createdAt: true,
      bannedAt: true,
      banReason: true,
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });
  if (!user) throw new NotFoundError("ไม่พบผู้ใช้");
  const { passwordHash, accounts, ...profile } = user;

  const [storyGroups, views, reportsOpen, reportsTotal, lastBan] = await Promise.all([
    prisma.story.groupBy({ by: ["status"], where: { authorId: id }, _count: { _all: true } }),
    prisma.story.aggregate({ where: { authorId: id }, _sum: { viewCount: true } }),
    prisma.report.count({ where: { story: { authorId: id }, status: ReportStatus.OPEN } }),
    prisma.report.count({ where: { story: { authorId: id } } }),
    user.status === UserStatus.BANNED
      ? prisma.auditLog.findFirst({
          where: { targetType: AUDIT_TARGET.USER, targetId: id, action: AUDIT_ACTION.USER_BAN },
          orderBy: { createdAt: "desc" },
          select: { admin: { select: { id: true, name: true, username: true } } },
        })
      : null,
  ]);
  const totalStories = storyGroups.reduce((sum, group) => sum + group._count._all, 0);
  const published = storyGroups.find((group) => group.status === StoryStatus.APPROVED)?._count._all ?? 0;

  return {
    ...profile,
    isAdminAccount: passwordHash !== null,
    providers: [...new Set(accounts.map((account) => account.provider))],
    bannedBy: lastBan?.admin ?? null,
    stats: {
      totalStories,
      published,
      totalViews: views._sum.viewCount ?? 0,
      reportsOpen,
      reportsTotal,
    },
  };
}

const reportListSelect = {
  id: true,
  reasonType: true,
  reason: true,
  status: true,
  resolution: true,
  createdAt: true,
  resolvedAt: true,
  story: { select: { id: true, title: true, status: true } },
  reporter: { select: { id: true, name: true } },
} satisfies Prisma.ReportSelect;

export async function listUserReports(
  userId: string,
  kind: "received" | "sent",
  page: number,
  pageSize: number
) {
  const where: Prisma.ReportWhereInput =
    kind === "received" ? { story: { authorId: userId } } : { reporterId: userId };
  const [data, total] = await Promise.all([
    prisma.report.findMany({
      where,
      select: reportListSelect,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.report.count({ where }),
  ]);
  return { data, meta: pageMeta(page, pageSize, total) };
}

export async function userHistory(userId: string) {
  const stories = await prisma.story.findMany({ where: { authorId: userId }, select: { id: true } });
  return auditLogsFor({
    OR: [
      { targetType: AUDIT_TARGET.USER, targetId: userId },
      ...(stories.length ? [{ targetId: { in: stories.map((story) => story.id) } }] : []),
    ],
  });
}

export async function moderateUser(
  targetId: string,
  input: ModerateUserInput,
  admin: { id: string }
) {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, status: true },
  });
  if (!target) throw new NotFoundError("ไม่พบผู้ใช้");
  if (target.id === admin.id) throw new ForbiddenError("ไม่สามารถระงับหรือยกเลิกระงับบัญชีของตัวเองได้");
  if (target.role === UserRole.ADMIN) throw new ForbiddenError("ไม่สามารถระงับบัญชีผู้ดูแลระบบได้");

  if (input.action === "UNBAN") {
    return prisma.$transaction(async (tx) => {
      const { count } = await tx.user.updateMany({
        where: { id: targetId, status: UserStatus.BANNED },
        data: { status: UserStatus.ACTIVE, bannedAt: null, banReason: null },
      });
      if (count === 0) throw new ConflictError("สถานะผู้ใช้เปลี่ยนไปแล้ว กรุณารีเฟรช");
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: AUDIT_ACTION.USER_UNBAN,
          targetType: AUDIT_TARGET.USER,
          targetId,
          note: input.reason?.trim() || null,
        },
      });
      return { status: UserStatus.ACTIVE, hiddenStories: 0 };
    });
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.user.updateMany({
      where: { id: targetId, status: UserStatus.ACTIVE },
      data: { status: UserStatus.BANNED, bannedAt: new Date(), banReason: input.reason },
    });
    if (count === 0) throw new ConflictError("สถานะผู้ใช้เปลี่ยนไปแล้ว กรุณารีเฟรช");
    // Signs the user out of the public site immediately.
    await tx.session.deleteMany({ where: { userId: targetId } });

    let hiddenStories = 0;
    if (input.hideStories) {
      const published = await tx.story.findMany({
        where: { authorId: targetId, status: StoryStatus.APPROVED },
        select: { id: true },
      });
      const ids = published.map((story) => story.id);
      if (ids.length) {
        const hidden = await tx.story.updateMany({
          where: { id: { in: ids }, status: StoryStatus.APPROVED },
          data: { status: StoryStatus.REJECTED, rejectReason: input.reason },
        });
        hiddenStories = hidden.count;
        await tx.auditLog.createMany({
          data: ids.map((storyId) => ({
            adminId: admin.id,
            action: AUDIT_ACTION.STORY_HIDE,
            targetType: AUDIT_TARGET.STORY,
            targetId: storyId,
            note: `ระงับผู้เขียน — ${input.reason}`,
          })),
        });
      }
    }
    await tx.auditLog.create({
      data: {
        adminId: admin.id,
        action: AUDIT_ACTION.USER_BAN,
        targetType: AUDIT_TARGET.USER,
        targetId,
        note: hiddenStories ? `${input.reason} (ซ่อน ${hiddenStories} เรื่อง)` : input.reason,
      },
    });
    return { status: UserStatus.BANNED, hiddenStories };
  });
}
