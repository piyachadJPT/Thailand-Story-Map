import type { Prisma } from "@prisma/client";
import { prisma } from "@/api/db/prisma";
import { AUDIT_TARGET } from "@/config/auditActions";
import type { AdminAuditQuery } from "@/models/schemas/admin";
import { bangkokDayStart } from "./time";

const auditSelect = {
  id: true,
  action: true,
  targetType: true,
  targetId: true,
  note: true,
  createdAt: true,
  admin: { select: { id: true, name: true, username: true, image: true } },
} as const;

type AuditRow = Prisma.AuditLogGetPayload<{ select: typeof auditSelect }>;

/** Adds a human label for each log's target (story title, user name, …). */
export async function describeAuditLogs(logs: AuditRow[]) {
  const storyIds = logs
    .filter((log) => log.targetType === AUDIT_TARGET.STORY || log.targetType === AUDIT_TARGET.REPORT)
    .map((log) => log.targetId);
  const userIds = logs
    .filter((log) => log.targetType === AUDIT_TARGET.USER || log.targetType === AUDIT_TARGET.ADMIN)
    .map((log) => log.targetId);
  const [stories, users] = await Promise.all([
    storyIds.length
      ? prisma.story.findMany({
          where: { id: { in: [...new Set(storyIds)] } },
          select: { id: true, title: true },
        })
      : [],
    userIds.length
      ? prisma.user.findMany({
          where: { id: { in: [...new Set(userIds)] } },
          select: { id: true, name: true, username: true },
        })
      : [],
  ]);
  const storyTitle = new Map(stories.map((story) => [story.id, story.title]));
  const userName = new Map(users.map((user) => [user.id, user.username ?? user.name]));
  return logs.map((log) => ({
    ...log,
    targetLabel:
      log.targetType === AUDIT_TARGET.USER || log.targetType === AUDIT_TARGET.ADMIN
        ? (userName.get(log.targetId) ?? null)
        : (storyTitle.get(log.targetId) ?? null),
  }));
}

export async function listAuditLogs(query: AdminAuditQuery) {
  const where: Prisma.AuditLogWhereInput = {
    ...(query.action ? { action: query.action } : {}),
    ...(query.adminId ? { adminId: query.adminId } : {}),
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from ? { gte: bangkokDayStart(query.from) } : {}),
            ...(query.to
              ? { lt: new Date(bangkokDayStart(query.to).getTime() + 24 * 60 * 60 * 1000) }
              : {}),
          },
        }
      : {}),
  };
  const [rows, total, admins] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      select: auditSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.auditLog.count({ where }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, username: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return {
    data: await describeAuditLogs(rows),
    meta: pageMeta(query.page, query.pageSize, total),
    admins,
  };
}

export async function auditLogsFor(where: Prisma.AuditLogWhereInput, take = 50) {
  const rows = await prisma.auditLog.findMany({
    where,
    select: auditSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
  });
  return describeAuditLogs(rows);
}

export function pageMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
